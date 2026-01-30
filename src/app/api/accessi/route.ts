import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyLaravelToken } from '@/lib/laravelAuth';

export const dynamic = 'force-dynamic';

// GET - Lista accessi
export async function GET(request: NextRequest) {
  const auth = await verifyLaravelToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const sede = url.searchParams.get('sede');
    const dataInizio = url.searchParams.get('dataInizio');
    const dataFine = url.searchParams.get('dataFine');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (sede) {
      where.sede_id = parseInt(sede);
    }
    if (dataInizio) {
      where.data_ora = { gte: new Date(dataInizio) };
    }
    if (dataFine) {
      where.data_ora = { ...(where.data_ora as object || {}), lte: new Date(dataFine) };
    }

    const [accessi, total] = await Promise.all([
      prisma.accessi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data_ora: 'desc' },
      }),
      prisma.accessi.count({ where }),
    ]);

    // Get cliente info for each accesso
    const clienteIds = [...new Set(accessi.map(a => a.cliente_id))];
    const clienti = await prisma.clienti.findMany({
      where: { id: { in: clienteIds } },
      select: {
        id: true,
        nome: true,
        cognome: true,
        email: true,
        avatar: true,
      },
    });

    const clientiMap = new Map(clienti.map(c => [c.id, c]));

    const data = accessi.map(a => ({
      id: a.id,
      cliente: clientiMap.get(a.cliente_id) || { id: a.cliente_id, nome: 'N/A', cognome: '', email: '' },
      sede_id: a.sede_id,
      tipo: a.tipo,
      metodo: a.metodo,
      dataOra: a.data_ora,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[ACCESSI] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel recupero degli accessi' },
      { status: 500 }
    );
  }
}

// POST - Registra nuovo accesso
export async function POST(request: NextRequest) {
  const auth = await verifyLaravelToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { cliente_id, sede_id, tipo, metodo } = body;

    if (!cliente_id) {
      return NextResponse.json(
        { success: false, error: 'cliente_id è obbligatorio' },
        { status: 400 }
      );
    }

    // Verify cliente exists
    const cliente = await prisma.clienti.findUnique({
      where: { id: cliente_id },
    });

    if (!cliente) {
      return NextResponse.json(
        { success: false, error: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    // Create accesso
    const accesso = await prisma.accessi.create({
      data: {
        cliente_id,
        sede_id: sede_id || null,
        tipo: tipo || 'ingresso',
        metodo: metodo || 'manuale',
        data_ora: new Date(),
      },
    });

    // Update ultimo_accesso on cliente
    await prisma.clienti.update({
      where: { id: cliente_id },
      data: { ultimo_accesso: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: accesso,
    });
  } catch (error) {
    console.error('[ACCESSI] POST Error:', error);
    return NextResponse.json(
      { success: false, error: "Errore nella registrazione dell'accesso" },
      { status: 500 }
    );
  }
}
