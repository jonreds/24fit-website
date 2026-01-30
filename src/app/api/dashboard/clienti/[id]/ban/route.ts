import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, ROLE_HIERARCHY } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Ban or unban a client
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only admin+ can ban
  if (ROLE_HIERARCHY[auth.ruolo as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY.admin) {
    return NextResponse.json(
      { success: false, message: 'Permessi insufficienti' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
      return NextResponse.json(
        { success: false, message: 'ID cliente non valido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, motivo, giorni } = body;

    const client = await prisma.clienti.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        email: true,
        nome: true,
        cognome: true,
        stato_account: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    if (action === 'ban') {
      // Ban the client
      if (client.stato_account === 'bannato') {
        return NextResponse.json(
          { success: false, message: 'Cliente già bannato' },
          { status: 400 }
        );
      }

      const banDataInizio = new Date();
      let banDataFine = null;

      // If giorni is provided, it's a temporary ban
      if (giorni && giorni > 0) {
        banDataFine = new Date();
        banDataFine.setDate(banDataFine.getDate() + giorni);
      }

      await prisma.clienti.update({
        where: { id: clientId },
        data: {
          stato_account: 'bannato',
          ban_data_inizio: banDataInizio,
          ban_data_fine: banDataFine,
          ban_motivo: motivo || 'Violazione dei termini di servizio',
        },
      });

      // Log the action as a note
      await prisma.note_cliente.create({
        data: {
          cliente_id: clientId,
          autore_id: auth.userId,
          autore_ruolo: auth.ruolo,
          contenuto: banDataFine
            ? `Cliente sospeso per ${giorni} giorni. Motivo: ${motivo || 'Non specificato'}`
            : `Cliente bannato permanentemente. Motivo: ${motivo || 'Non specificato'}`,
          tipo: 'importante',
          visibile_a: 'admin+',
        },
      });

      return NextResponse.json({
        success: true,
        message: banDataFine
          ? `Cliente sospeso fino al ${banDataFine.toLocaleDateString('it-IT')}`
          : 'Cliente bannato permanentemente',
        data: {
          ban_data_inizio: banDataInizio,
          ban_data_fine: banDataFine,
        },
      });
    } else if (action === 'unban') {
      // Unban the client
      if (client.stato_account !== 'bannato') {
        return NextResponse.json(
          { success: false, message: 'Cliente non è bannato' },
          { status: 400 }
        );
      }

      await prisma.clienti.update({
        where: { id: clientId },
        data: {
          stato_account: 'attivo',
          ban_data_inizio: null,
          ban_data_fine: null,
          ban_motivo: null,
        },
      });

      // Log the action as a note
      await prisma.note_cliente.create({
        data: {
          cliente_id: clientId,
          autore_id: auth.userId,
          autore_ruolo: auth.ruolo,
          contenuto: `Ban rimosso. ${motivo ? `Motivo: ${motivo}` : ''}`,
          tipo: 'nota',
          visibile_a: 'admin+',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Ban rimosso',
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Azione non valida. Usa "ban" o "unban"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[DASHBOARD BAN] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nella gestione del ban' },
      { status: 500 }
    );
  }
}
