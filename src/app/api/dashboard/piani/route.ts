import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, ROLE_HIERARCHY } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - List all plans
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
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    const where = includeInactive ? {} : { attivo: true };

    const piani = await prisma.piani.findMany({
      where,
      orderBy: { ordine: 'asc' },
      include: {
        _count: {
          select: { clienti: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: piani.map((piano) => ({
        ...piano,
        clienti_count: piano._count.clienti,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error('[DASHBOARD PIANI GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero dei piani' },
      { status: 500 }
    );
  }
}

// POST - Create a new plan
export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only admin+ can create plans
  if (ROLE_HIERARCHY[auth.ruolo as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY.admin) {
    return NextResponse.json(
      { success: false, message: 'Permessi insufficienti' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      nome,
      descrizione,
      durata_mesi,
      prezzo,
      quota_iscrizione = 0,
      giorni_pausa_inclusi = 0,
      pausa_minima_giorni = 3,
      promo_attiva = false,
      promo_nome,
      promo_prezzo,
      popolare = false,
      features,
      ordine = 0,
    } = body;

    // Validate required fields
    if (!nome || !durata_mesi || prezzo === undefined) {
      return NextResponse.json(
        { success: false, message: 'Nome, durata e prezzo sono obbligatori' },
        { status: 400 }
      );
    }

    // Calculate prices
    const prezzoDecimal = parseFloat(prezzo);
    const quotaDecimal = parseFloat(quota_iscrizione);
    const prezzoTotale = prezzoDecimal + quotaDecimal;
    const prezzoMensile = prezzoDecimal / durata_mesi;

    const piano = await prisma.piani.create({
      data: {
        nome,
        descrizione,
        durata_mesi,
        prezzo: prezzoDecimal,
        prezzo_mensile: prezzoMensile,
        quota_iscrizione: quotaDecimal,
        prezzo_totale: prezzoTotale,
        giorni_pausa_inclusi,
        pausa_minima_giorni,
        promo_attiva,
        promo_nome: promo_attiva ? promo_nome : null,
        promo_prezzo: promo_attiva && promo_prezzo ? parseFloat(promo_prezzo) : null,
        popolare,
        features: features || null,
        ordine,
        attivo: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Piano creato',
      data: piano,
    });
  } catch (error) {
    console.error('[DASHBOARD PIANI POST] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nella creazione del piano' },
      { status: 500 }
    );
  }
}

// PUT - Update a plan
export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only admin+ can update plans
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
        { success: false, message: 'ID piano obbligatorio' },
        { status: 400 }
      );
    }

    // Check if plan exists
    const existingPlan = await prisma.piani.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, message: 'Piano non trovato' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (updateFields.nome !== undefined) updateData.nome = updateFields.nome;
    if (updateFields.descrizione !== undefined) updateData.descrizione = updateFields.descrizione;
    if (updateFields.durata_mesi !== undefined) updateData.durata_mesi = updateFields.durata_mesi;
    if (updateFields.prezzo !== undefined) {
      updateData.prezzo = parseFloat(updateFields.prezzo);
    }
    if (updateFields.quota_iscrizione !== undefined) {
      updateData.quota_iscrizione = parseFloat(updateFields.quota_iscrizione);
    }
    if (updateFields.giorni_pausa_inclusi !== undefined) {
      updateData.giorni_pausa_inclusi = updateFields.giorni_pausa_inclusi;
    }
    if (updateFields.pausa_minima_giorni !== undefined) {
      updateData.pausa_minima_giorni = updateFields.pausa_minima_giorni;
    }
    if (updateFields.promo_attiva !== undefined) {
      updateData.promo_attiva = updateFields.promo_attiva;
      if (!updateFields.promo_attiva) {
        updateData.promo_nome = null;
        updateData.promo_prezzo = null;
      }
    }
    if (updateFields.promo_nome !== undefined) updateData.promo_nome = updateFields.promo_nome;
    if (updateFields.promo_prezzo !== undefined) {
      updateData.promo_prezzo = updateFields.promo_prezzo ? parseFloat(updateFields.promo_prezzo) : null;
    }
    if (updateFields.popolare !== undefined) updateData.popolare = updateFields.popolare;
    if (updateFields.in_evidenza !== undefined) {
      updateData.in_evidenza = updateFields.in_evidenza;
      // If setting as featured, remove featured from other plans
      if (updateFields.in_evidenza) {
        await prisma.piani.updateMany({
          where: {
            id: { not: id },
            in_evidenza: true,
          },
          data: { in_evidenza: false },
        });
      }
    }
    if (updateFields.features !== undefined) updateData.features = updateFields.features;
    if (updateFields.ordine !== undefined) updateData.ordine = updateFields.ordine;
    if (updateFields.attivo !== undefined) updateData.attivo = updateFields.attivo;

    // Recalculate prices if needed
    if (updateData.prezzo !== undefined || updateData.quota_iscrizione !== undefined || updateData.durata_mesi !== undefined) {
      const prezzo = (updateData.prezzo as number) ?? existingPlan.prezzo;
      const quota = (updateData.quota_iscrizione as number) ?? existingPlan.quota_iscrizione;
      const durata = (updateData.durata_mesi as number) ?? existingPlan.durata_mesi;

      updateData.prezzo_totale = Number(prezzo) + Number(quota);
      updateData.prezzo_mensile = Number(prezzo) / durata;
    }

    const updatedPlan = await prisma.piani.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Piano aggiornato',
      data: updatedPlan,
    });
  } catch (error) {
    console.error('[DASHBOARD PIANI PUT] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'aggiornamento del piano' },
      { status: 500 }
    );
  }
}

// DELETE - Delete (deactivate) a plan
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only superadmin can delete plans
  if (auth.ruolo !== 'superadmin') {
    return NextResponse.json(
      { success: false, message: 'Solo i superadmin possono eliminare piani' },
      { status: 403 }
    );
  }

  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '');

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'ID piano non valido' },
        { status: 400 }
      );
    }

    // Check if plan has active clients
    const clientCount = await prisma.clienti.count({
      where: {
        piano_id: id,
        abbonamento_attivo: true,
      },
    });

    if (clientCount > 0) {
      return NextResponse.json(
        { success: false, message: `Non puoi eliminare un piano con ${clientCount} clienti attivi. Disattivalo invece.` },
        { status: 400 }
      );
    }

    // Soft delete by deactivating
    await prisma.piani.update({
      where: { id },
      data: { attivo: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Piano disattivato',
    });
  } catch (error) {
    console.error('[DASHBOARD PIANI DELETE] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'eliminazione del piano' },
      { status: 500 }
    );
  }
}
