import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { sendDocumentUploadNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@24fit.it';
// GDPR: Documenti salvati FUORI dalla cartella public
const UPLOAD_DIR = '/var/www/24fit-storage/documents';

// Generate secure random filename
function generateSecureFilename(originalExt: string): string {
  const uuid = crypto.randomUUID();
  return `${uuid}${originalExt}`;
}

// Verify JWT and get user ID
function verifyToken(request: NextRequest): { userId: number } | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyToken(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { message: 'Non autorizzato', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const tipoDocumento = formData.get('tipo_documento') as string | null;
    const dataScadenza = formData.get('data_scadenza') as string | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: 'File mancante', code: 'MISSING_FILE' } },
        { status: 400 }
      );
    }

    if (!tipoDocumento || !['identita', 'certificato_medico'].includes(tipoDocumento)) {
      return NextResponse.json(
        { success: false, error: { message: 'Tipo documento non valido', code: 'INVALID_TYPE' } },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { message: 'Tipo file non supportato. Usa JPG, PNG, WebP o PDF', code: 'INVALID_FILE_TYPE' } },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: { message: 'File troppo grande. Massimo 10MB', code: 'FILE_TOO_LARGE' } },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.clienti.findUnique({
      where: { id: auth.userId },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: { message: 'Cliente non trovato', code: 'CLIENT_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Create client directory (organized by year/month for scalability)
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const clientDir = path.join(UPLOAD_DIR, yearMonth, String(auth.userId));
    await mkdir(clientDir, { recursive: true });

    // Generate secure filename (UUID-based)
    const ext = path.extname(file.name) || '.jpg';
    const secureFileName = generateSecureFilename(ext);
    const filePath = path.join(clientDir, secureFileName);

    // Store relative path in DB (for serving via authenticated API)
    const relativePath = `${yearMonth}/${auth.userId}/${secureFileName}`;

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Parse expiry date if provided
    let expiryDate: Date | null = null;
    if (dataScadenza) {
      expiryDate = new Date(dataScadenza);
      if (isNaN(expiryDate.getTime())) {
        expiryDate = null;
      }
    }

    // Check for existing document of same type and mark as replaced
    await prisma.documenti_verifica.updateMany({
      where: {
        cliente_id: auth.userId,
        tipo_documento: tipoDocumento,
        stato: 'pending',
      },
      data: {
        stato: 'replaced',
        updated_at: new Date(),
      },
    });

    // Create document record
    const document = await prisma.documenti_verifica.create({
      data: {
        cliente_id: auth.userId,
        tipo_documento: tipoDocumento,
        file_path: relativePath,
        file_name: file.name, // Original name for display
        file_size: file.size,
        mime_type: file.type,
        stato: 'pending',
        data_scadenza: expiryDate,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Send notification email to admin (async)
    const clientFullName = `${client.nome || ''} ${client.cognome || ''}`.trim();
    sendDocumentUploadNotification({
      to: ADMIN_EMAIL,
      clienteNome: clientFullName,
      clienteEmail: client.email,
      tipoDocumento: tipoDocumento,
    }).catch(err => {
      console.error('Failed to send upload notification:', err);
    });

    return NextResponse.json({
      success: true,
      data: {
        id: document.id,
        tipo_documento: document.tipo_documento,
        file_name: document.file_name,
        stato: document.stato,
        data_scadenza: document.data_scadenza,
        created_at: document.created_at,
      },
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Errore durante il caricamento', code: 'UPLOAD_ERROR' } },
      { status: 500 }
    );
  }
}
