import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyLaravelToken } from '@/lib/laravelAuth';
import { sendDocumentApprovedNotification, sendDocumentRejectedNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://dashboard.24fit.it',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyLaravelToken(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { document_id, stato, note } = body;

    if (!document_id || !stato) {
      return NextResponse.json(
        { success: false, error: 'document_id e stato sono obbligatori' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!['approved', 'rejected'].includes(stato)) {
      return NextResponse.json(
        { success: false, error: 'Stato non valido. Usa approved o rejected' },
        { status: 400, headers: corsHeaders }
      );
    }

    const document = await prisma.documenti_verifica.findUnique({
      where: { id: document_id },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Documento non trovato' },
        { status: 404, headers: corsHeaders }
      );
    }

    const client = await prisma.clienti.findUnique({
      where: { id: document.cliente_id },
      select: { nome: true, cognome: true, email: true },
    });

    const updatedDoc = await prisma.documenti_verifica.update({
      where: { id: document_id },
      data: {
        stato,
        note_verifica: note || null,
        verificato_da: auth.userId,
        data_verifica: new Date(),
        updated_at: new Date(),
      },
    });

    if (stato === 'approved') {
      const allDocs = await prisma.documenti_verifica.findMany({
        where: { cliente_id: document.cliente_id },
      });
      const hasIdentity = allDocs.some(d => d.tipo_documento === 'identita' && d.stato === 'approved');
      const hasCertificate = allDocs.some(d => d.tipo_documento === 'certificato_medico' && d.stato === 'approved');
      if (hasIdentity && hasCertificate) {
        await prisma.clienti.update({
          where: { id: document.cliente_id },
          data: { onboarding_completato: true },
        });
      }
    }

    const staff = await prisma.users.findUnique({
      where: { id: auth.userId },
      select: { nome: true, cognome: true, email: true },
    });

    console.log(`Document ${document_id} ${stato} by ${staff?.nome} ${staff?.cognome} (${auth.userId})`);

    if (client?.email) {
      if (stato === 'approved') {
        sendDocumentApprovedNotification({
          to: client.email,
          nome: client.nome || '',
          tipoDocumento: document.tipo_documento,
        }).catch(err => console.error('Error sending approval email:', err));
      } else if (stato === 'rejected') {
        sendDocumentRejectedNotification({
          to: client.email,
          nome: client.nome || '',
          tipoDocumento: document.tipo_documento,
          motivo: note || undefined,
        }).catch(err => console.error('Error sending rejection email:', err));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        stato: updatedDoc.stato,
        note_verifica: updatedDoc.note_verifica,
        verificato_da: auth.userId,
        verificato_da_nome: staff ? `${staff.nome} ${staff.cognome}` : null,
        data_verifica: updatedDoc.data_verifica,
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[DOCUMENTS VERIFY] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nella verifica del documento' },
      { status: 500, headers: corsHeaders }
    );
  }
}
