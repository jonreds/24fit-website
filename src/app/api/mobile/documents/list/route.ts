import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

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

export async function GET(request: NextRequest) {
  try {
    const auth = verifyToken(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { message: 'Non autorizzato', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Get all documents for this client
    const documents = await prisma.documenti_verifica.findMany({
      where: { cliente_id: auth.userId },
      orderBy: { created_at: 'desc' },
    });

    // Get the latest document of each type
    const identitaDoc = documents.find(d => d.tipo_documento === 'identita');
    const certificatoDoc = documents.find(d => d.tipo_documento === 'certificato_medico');

    // Check what documents are needed
    const requiredDocuments = {
      identita: {
        uploaded: !!identitaDoc,
        status: identitaDoc?.stato || 'missing',
        lastDocument: identitaDoc || null,
      },
      certificato_medico: {
        uploaded: !!certificatoDoc,
        status: certificatoDoc?.stato || 'missing',
        expiry: certificatoDoc?.data_scadenza || null,
        lastDocument: certificatoDoc || null,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        documents: documents.map(doc => ({
          id: doc.id,
          tipo_documento: doc.tipo_documento,
          file_path: doc.file_path,
          file_name: doc.file_name,
          stato: doc.stato,
          note_verifica: doc.note_verifica,
          data_scadenza: doc.data_scadenza,
          data_verifica: doc.data_verifica,
          created_at: doc.created_at,
        })),
        summary: requiredDocuments,
      },
    });
  } catch (error) {
    console.error('List documents error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Errore nel recupero documenti', code: 'FETCH_ERROR' } },
      { status: 500 }
    );
  }
}
