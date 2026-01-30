import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, canViewNote, canEditNote } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get all notes for a client
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

    return NextResponse.json({
      success: true,
      data: visibleNotes,
    });
  } catch (error) {
    console.error('[DASHBOARD NOTE GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero delle note' },
      { status: 500 }
    );
  }
}

// POST - Create a new note
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
    const { contenuto, tipo = 'nota', visibile_a = 'all' } = body;

    if (!contenuto || contenuto.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Il contenuto della nota è obbligatorio' },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.clienti.findUnique({
      where: { id: clientId },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    // Validate visibility
    const validVisibility = ['all', 'admin+', 'manager+', 'same_level'];
    if (!validVisibility.includes(visibile_a)) {
      return NextResponse.json(
        { success: false, message: 'Visibilità non valida' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['nota', 'avviso', 'importante'];
    if (!validTypes.includes(tipo)) {
      return NextResponse.json(
        { success: false, message: 'Tipo nota non valido' },
        { status: 400 }
      );
    }

    const note = await prisma.note_cliente.create({
      data: {
        cliente_id: clientId,
        autore_id: auth.userId,
        autore_ruolo: auth.ruolo,
        contenuto: contenuto.trim(),
        tipo,
        visibile_a,
      },
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

    return NextResponse.json({
      success: true,
      message: 'Nota creata',
      data: note,
    });
  } catch (error) {
    console.error('[DASHBOARD NOTE POST] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nella creazione della nota' },
      { status: 500 }
    );
  }
}

// PUT - Update a note
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
    const body = await request.json();
    const { noteId, contenuto, tipo, visibile_a } = body;

    if (!noteId) {
      return NextResponse.json(
        { success: false, message: 'ID nota obbligatorio' },
        { status: 400 }
      );
    }

    // Get the note to check permissions
    const note = await prisma.note_cliente.findUnique({
      where: { id: noteId },
      select: {
        autore_ruolo: true,
        autore_id: true,
      },
    });

    if (!note) {
      return NextResponse.json(
        { success: false, message: 'Nota non trovata' },
        { status: 404 }
      );
    }

    // Check if user can edit this note
    if (!canEditNote(auth.ruolo, note.autore_ruolo)) {
      return NextResponse.json(
        { success: false, message: 'Non hai i permessi per modificare questa nota' },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (contenuto) updateData.contenuto = contenuto.trim();
    if (tipo) updateData.tipo = tipo;
    if (visibile_a) updateData.visibile_a = visibile_a;

    const updatedNote = await prisma.note_cliente.update({
      where: { id: noteId },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      message: 'Nota aggiornata',
      data: updatedNote,
    });
  } catch (error) {
    console.error('[DASHBOARD NOTE PUT] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'aggiornamento della nota' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a note
export async function DELETE(
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
    const url = new URL(request.url);
    const noteId = parseInt(url.searchParams.get('noteId') || '');

    if (isNaN(noteId)) {
      return NextResponse.json(
        { success: false, message: 'ID nota non valido' },
        { status: 400 }
      );
    }

    // Get the note to check permissions
    const note = await prisma.note_cliente.findUnique({
      where: { id: noteId },
      select: {
        autore_ruolo: true,
        autore_id: true,
      },
    });

    if (!note) {
      return NextResponse.json(
        { success: false, message: 'Nota non trovata' },
        { status: 404 }
      );
    }

    // Check if user can delete this note
    if (!canEditNote(auth.ruolo, note.autore_ruolo)) {
      return NextResponse.json(
        { success: false, message: 'Non hai i permessi per eliminare questa nota' },
        { status: 403 }
      );
    }

    await prisma.note_cliente.delete({
      where: { id: noteId },
    });

    return NextResponse.json({
      success: true,
      message: 'Nota eliminata',
    });
  } catch (error) {
    console.error('[DASHBOARD NOTE DELETE] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'eliminazione della nota' },
      { status: 500 }
    );
  }
}
