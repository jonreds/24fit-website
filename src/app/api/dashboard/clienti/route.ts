import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - List all clients with filters and pagination
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
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status'); // attivi, scaduti, bannati, sospesi
    const orderBy = url.searchParams.get('orderBy') || 'created_at';
    const orderDir = url.searchParams.get('orderDir') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { nome: { contains: search } },
        { cognome: { contains: search } },
        { email: { contains: search } },
        { telefono: { contains: search } },
        { codice_fiscale: { contains: search } },
      ];
    }

    if (status === 'attivi') {
      where.abbonamento_attivo = true;
      where.stato_account = 'attivo';
    } else if (status === 'scaduti') {
      where.abbonamento_attivo = false;
    } else if (status === 'bannati') {
      where.stato_account = 'bannato';
    } else if (status === 'sospesi') {
      where.stato_account = 'sospeso';
    }

    // Build orderBy
    const order: Record<string, string> = {};
    order[orderBy] = orderDir;

    const [clienti, total] = await Promise.all([
      prisma.clienti.findMany({
        where,
        skip,
        take: limit,
        orderBy: order,
        select: {
          id: true,
          email: true,
          nome: true,
          cognome: true,
          telefono: true,
          avatar: true,
          abbonamento_attivo: true,
          abbonamento_tipo: true,
          abbonamento_scadenza: true,
          stato_account: true,
          ban_data_fine: true,
          documento_verificato: true,
          pausa_attiva: true,
          ultimo_accesso: true,
          created_at: true,
        },
      }),
      prisma.clienti.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: clienti,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[DASHBOARD CLIENTI GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero dei clienti' },
      { status: 500 }
    );
  }
}
