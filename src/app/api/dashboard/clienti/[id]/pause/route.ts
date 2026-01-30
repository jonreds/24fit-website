import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, ROLE_HIERARCHY } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get pause history for a client
export async function GET(
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

  try {
    const { id } = await params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
      return NextResponse.json(
        { success: false, message: 'ID cliente non valido' },
        { status: 400 }
      );
    }

    const pauses = await prisma.pause_abbonamento.findMany({
      where: { cliente_id: clientId },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: pauses,
    });
  } catch (error) {
    console.error('[DASHBOARD PAUSE] GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero delle pause' },
      { status: 500 }
    );
  }
}

// POST - Create a new pause
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

  // Only staff+ can create pauses
  if (ROLE_HIERARCHY[auth.ruolo as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY.staff) {
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
    const { data_inizio, data_fine, motivo } = body;

    if (!data_inizio || !data_fine) {
      return NextResponse.json(
        { success: false, message: 'data_inizio e data_fine sono obbligatori' },
        { status: 400 }
      );
    }

    const startDate = new Date(data_inizio);
    const endDate = new Date(data_fine);

    if (endDate <= startDate) {
      return NextResponse.json(
        { success: false, message: 'La data fine deve essere successiva alla data inizio' },
        { status: 400 }
      );
    }

    // Get client and check subscription
    const client = await prisma.clienti.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        nome: true,
        cognome: true,
        abbonamento_attivo: true,
        abbonamento_scadenza: true,
        pausa_attiva: true,
        giorni_pausa_totali: true,
        giorni_pausa_usati: true,
        piano_id: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    if (!client.abbonamento_attivo) {
      return NextResponse.json(
        { success: false, message: 'Il cliente non ha un abbonamento attivo' },
        { status: 400 }
      );
    }

    if (client.pausa_attiva) {
      return NextResponse.json(
        { success: false, message: 'Il cliente ha già una pausa attiva' },
        { status: 400 }
      );
    }

    // Calculate pause days
    const pauseDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Get pause days limit from plan
    let pauseDaysLimit = 0;
    if (client.piano_id) {
      const piano = await prisma.piani.findUnique({
        where: { id: client.piano_id },
        select: { giorni_pausa_inclusi: true, pausa_minima_giorni: true },
      });
      if (piano?.giorni_pausa_inclusi) {
        pauseDaysLimit = piano.giorni_pausa_inclusi;
      }
    }

    const remainingPauseDays = pauseDaysLimit - (client.giorni_pausa_usati || 0);

    // Check if pause days are available (admin can override)
    if (pauseDays > remainingPauseDays && ROLE_HIERARCHY[auth.ruolo as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY.admin) {
      return NextResponse.json(
        { success: false, message: `Giorni pausa disponibili: ${remainingPauseDays}. Richiesti: ${pauseDays}` },
        { status: 400 }
      );
    }

    // Create pause record
    const pause = await prisma.pause_abbonamento.create({
      data: {
        cliente_id: clientId,
        data_inizio: startDate,
        data_fine: endDate,
        giorni: pauseDays,
        tipo: 'admin',
        admin_id: auth.userId,
        motivo: motivo || null,
      },
    });

    // Update client
    await prisma.clienti.update({
      where: { id: clientId },
      data: {
        pausa_attiva: true,
        pausa_data_inizio: startDate,
        pausa_data_fine: endDate,
        giorni_pausa_usati: (client.giorni_pausa_usati || 0) + pauseDays,
      },
    });

    // Log the action as a note
    await prisma.note_cliente.create({
      data: {
        cliente_id: clientId,
        autore_id: auth.userId,
        autore_ruolo: auth.ruolo,
        contenuto: `Pausa abbonamento creata: ${startDate.toLocaleDateString('it-IT')} - ${endDate.toLocaleDateString('it-IT')} (${pauseDays} giorni). ${motivo ? `Motivo: ${motivo}` : ''}`,
        tipo: 'nota',
        visibile_a: 'all',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Pausa creata: ${pauseDays} giorni`,
      data: pause,
    });
  } catch (error) {
    console.error('[DASHBOARD PAUSE] POST Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nella creazione della pausa' },
      { status: 500 }
    );
  }
}

// PUT - End a pause early
export async function PUT(
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

  try {
    const { id } = await params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
      return NextResponse.json(
        { success: false, message: 'ID cliente non valido' },
        { status: 400 }
      );
    }

    const client = await prisma.clienti.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        pausa_attiva: true,
        pausa_data_inizio: true,
        pausa_data_fine: true,
        abbonamento_scadenza: true,
        giorni_pausa_usati: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    if (!client.pausa_attiva) {
      return NextResponse.json(
        { success: false, message: 'Nessuna pausa attiva' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate actual pause days used
    const pauseStart = client.pausa_data_inizio!;
    const actualPauseDays = Math.max(0, Math.ceil((today.getTime() - pauseStart.getTime()) / (1000 * 60 * 60 * 24)));
    const plannedPauseDays = Math.ceil((client.pausa_data_fine!.getTime() - pauseStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysToReturn = plannedPauseDays - actualPauseDays;

    // Update the pause record
    await prisma.pause_abbonamento.updateMany({
      where: {
        cliente_id: clientId,
        data_inizio: pauseStart,
      },
      data: {
        data_fine: today,
        giorni: actualPauseDays,
      },
    });

    // Extend subscription by unused pause days
    let newScadenza = client.abbonamento_scadenza;
    if (newScadenza && daysToReturn > 0) {
      newScadenza = new Date(newScadenza);
      newScadenza.setDate(newScadenza.getDate() + daysToReturn);
    }

    // Recalculate giorni_pausa_usati
    const newGiorniUsati = Math.max(0, (client.giorni_pausa_usati || 0) - daysToReturn);

    await prisma.clienti.update({
      where: { id: clientId },
      data: {
        pausa_attiva: false,
        pausa_data_inizio: null,
        pausa_data_fine: null,
        abbonamento_scadenza: newScadenza,
        giorni_pausa_usati: newGiorniUsati,
      },
    });

    // Log the action as a note
    await prisma.note_cliente.create({
      data: {
        cliente_id: clientId,
        autore_id: auth.userId,
        autore_ruolo: auth.ruolo,
        contenuto: `Pausa terminata anticipatamente. Giorni usati: ${actualPauseDays}. Giorni restituiti: ${daysToReturn}.`,
        tipo: 'nota',
        visibile_a: 'all',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Pausa terminata. ${daysToReturn > 0 ? `${daysToReturn} giorni restituiti.` : ''}`,
      data: {
        giorni_usati: actualPauseDays,
        giorni_restituiti: daysToReturn,
        nuova_scadenza: newScadenza,
      },
    });
  } catch (error) {
    console.error('[DASHBOARD PAUSE] PUT Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nella chiusura della pausa' },
      { status: 500 }
    );
  }
}
