import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, ROLE_HIERARCHY } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - List all structure-specific promotions
export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const strutturaId = url.searchParams.get('strutturaId');
    const pianoId = url.searchParams.get('pianoId');

    const where: Record<string, unknown> = {};
    if (strutturaId) where.struttura_id = strutturaId;
    if (pianoId) where.piano_id = parseInt(pianoId);

    const promozioni = await prisma.promozioni_struttura.findMany({
      where,
      include: {
        piano: {
          select: {
            id: true,
            nome: true,
            prezzo: true,
            prezzo_totale: true,
          },
        },
      },
      orderBy: [
        { struttura_id: 'asc' },
        { piano_id: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: promozioni,
    });
  } catch (error) {
    console.error('[DASHBOARD PROMOZIONI-STRUTTURA GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero delle promozioni' },
      { status: 500 }
    );
  }
}

// POST - Create a new structure-specific promotion
export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only admin+ can create promotions
  if (ROLE_HIERARCHY[auth.ruolo as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY.admin) {
    return NextResponse.json(
      { success: false, message: 'Permessi insufficienti' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      piano_id,
      struttura_id,
      promo_attiva = true,
      promo_nome,
      promo_prezzo,
      data_inizio,
      data_fine,
    } = body;

    // Validate required fields
    if (!piano_id || !struttura_id) {
      return NextResponse.json(
        { success: false, message: 'Piano e struttura sono obbligatori' },
        { status: 400 }
      );
    }

    // Check if piano exists
    const piano = await prisma.piani.findUnique({
      where: { id: piano_id },
    });

    if (!piano) {
      return NextResponse.json(
        { success: false, message: 'Piano non trovato' },
        { status: 404 }
      );
    }

    // Check if promotion already exists for this combo
    const existing = await prisma.promozioni_struttura.findUnique({
      where: {
        piano_id_struttura_id: {
          piano_id,
          struttura_id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Esiste già una promozione per questo piano e struttura. Modificala invece.' },
        { status: 400 }
      );
    }

    const promozione = await prisma.promozioni_struttura.create({
      data: {
        piano_id,
        struttura_id,
        promo_attiva,
        promo_nome: promo_nome || null,
        promo_prezzo: promo_prezzo ? parseFloat(promo_prezzo) : null,
        data_inizio: data_inizio ? new Date(data_inizio) : null,
        data_fine: data_fine ? new Date(data_fine) : null,
      },
      include: {
        piano: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Promozione creata',
      data: promozione,
    });
  } catch (error) {
    console.error('[DASHBOARD PROMOZIONI-STRUTTURA POST] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nella creazione della promozione' },
      { status: 500 }
    );
  }
}

// PUT - Update a structure-specific promotion
export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only admin+ can update promotions
  if (ROLE_HIERARCHY[auth.ruolo as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY.admin) {
    return NextResponse.json(
      { success: false, message: 'Permessi insufficienti' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID promozione obbligatorio' },
        { status: 400 }
      );
    }

    // Check if promotion exists
    const existing = await prisma.promozioni_struttura.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Promozione non trovata' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (updateFields.promo_attiva !== undefined) updateData.promo_attiva = updateFields.promo_attiva;
    if (updateFields.promo_nome !== undefined) updateData.promo_nome = updateFields.promo_nome || null;
    if (updateFields.promo_prezzo !== undefined) {
      updateData.promo_prezzo = updateFields.promo_prezzo ? parseFloat(updateFields.promo_prezzo) : null;
    }
    if (updateFields.data_inizio !== undefined) {
      updateData.data_inizio = updateFields.data_inizio ? new Date(updateFields.data_inizio) : null;
    }
    if (updateFields.data_fine !== undefined) {
      updateData.data_fine = updateFields.data_fine ? new Date(updateFields.data_fine) : null;
    }

    const updated = await prisma.promozioni_struttura.update({
      where: { id },
      data: updateData,
      include: {
        piano: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Promozione aggiornata',
      data: updated,
    });
  } catch (error) {
    console.error('[DASHBOARD PROMOZIONI-STRUTTURA PUT] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'aggiornamento della promozione' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a structure-specific promotion
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only admin+ can delete promotions
  if (ROLE_HIERARCHY[auth.ruolo as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY.admin) {
    return NextResponse.json(
      { success: false, message: 'Permessi insufficienti' },
      { status: 403 }
    );
  }

  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '');

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'ID promozione non valido' },
        { status: 400 }
      );
    }

    await prisma.promozioni_struttura.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Promozione eliminata',
    });
  } catch (error) {
    console.error('[DASHBOARD PROMOZIONI-STRUTTURA DELETE] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'eliminazione della promozione' },
      { status: 500 }
    );
  }
}
