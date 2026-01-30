import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, canViewNote } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get single client details
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

    // Get client base data
    const client = await prisma.clienti.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    // Get piano info if piano_id exists
    let piano = null;
    if (client.piano_id) {
      piano = await prisma.piani.findUnique({
        where: { id: client.piano_id },
      });
    }

    // Get pause history
    const pause = await prisma.pause_abbonamento.findMany({
      where: { cliente_id: clientId },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    // Get access history
    const accessi = await prisma.accessi.findMany({
      where: { cliente_id: clientId },
      orderBy: { data_ora: 'desc' },
      take: 50,
    });

    // Get notes with author info
    const notes = await prisma.note_cliente.findMany({
      where: { cliente_id: clientId },
      orderBy: { created_at: 'desc' },
      include: {
        autore: {
          select: {
            id: true,
            nome: true,
            cognome: true,
            ruolo: true,
          },
        },
      },
    });

    // Filter notes based on viewer's role
    const visibleNotes = notes.filter((note) =>
      canViewNote(auth.ruolo, note.visibile_a || 'all', note.autore_ruolo || 'staff')
    );

    // Remove password from response
    const { password, ...clientData } = client;

    return NextResponse.json({
      success: true,
      data: {
        ...clientData,
        piano,
        pause,
        accessi,
        note: visibleNotes,
      },
    });
  } catch (error) {
    console.error('[DASHBOARD CLIENTE GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero del cliente' },
      { status: 500 }
    );
  }
}

// PUT - Update client
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

    const body = await request.json();

    // Fields that can be updated by admin
    const allowedFields = [
      'nome',
      'cognome',
      'telefono',
      'indirizzo',
      'citta',
      'cap',
      'provincia',
      'abbonamento_attivo',
      'abbonamento_tipo',
      'abbonamento_scadenza',
      'giorni_pausa_totali',
      'documento_verificato',
      'onboarding_completato',
    ];

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle date fields
    if (updateData.abbonamento_scadenza) {
      updateData.abbonamento_scadenza = new Date(updateData.abbonamento_scadenza as string);
    }

    // Handle province uppercase
    if (updateData.provincia) {
      updateData.provincia = (updateData.provincia as string).toUpperCase();
    }

    const updatedClient = await prisma.clienti.update({
      where: { id: clientId },
      data: updateData,
      select: {
        id: true,
        email: true,
        nome: true,
        cognome: true,
        telefono: true,
        abbonamento_attivo: true,
        abbonamento_tipo: true,
        abbonamento_scadenza: true,
        giorni_pausa_totali: true,
        documento_verificato: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cliente aggiornato',
      data: updatedClient,
    });
  } catch (error) {
    console.error('[DASHBOARD CLIENTE PUT] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'aggiornamento del cliente' },
      { status: 500 }
    );
  }
}
