import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get all stats in parallel
    const [
      clientiTotali,
      clientiAttivi,
      abbonatiMese,
      pauseAttive,
      accessiOggi,
      scadenzaProssima,
      clientiBannati,
      recentAccessi,
    ] = await Promise.all([
      // Total clients
      prisma.clienti.count(),

      // Active subscriptions
      prisma.clienti.count({
        where: { abbonamento_attivo: true },
      }),

      // New subscribers this month
      prisma.clienti.count({
        where: {
          created_at: { gte: startOfMonth },
          abbonamento_attivo: true,
        },
      }),

      // Active pauses
      prisma.pause_abbonamento.count({
        where: {
          data_inizio: { lte: now },
          data_fine: { gte: now },
        },
      }),

      // Accesses today
      prisma.accessi.count({
        where: {
          data_ora: { gte: startOfDay },
        },
      }),

      // Expiring in 7 days
      prisma.clienti.count({
        where: {
          abbonamento_attivo: true,
          abbonamento_scadenza: {
            gte: now,
            lte: in7Days,
          },
        },
      }),

      // Banned clients
      prisma.clienti.count({
        where: { stato_account: 'bannato' },
      }),

      // Recent accesses for activity feed
      prisma.accessi.findMany({
        where: {
          data_ora: { gte: startOfDay },
        },
        orderBy: { data_ora: 'desc' },
        take: 10,
        include: {
          cliente: {
            select: {
              nome: true,
              cognome: true,
            },
          },
        },
      }),
    ]);

    // Calculate revenue (simplified - you may want to add a payments table)
    const ricaviMese = 0; // Would come from payments/invoices table

    // Format recent activity
    const recentActivity = recentAccessi.map((accesso) => ({
      id: accesso.id,
      tipo: 'accesso',
      descrizione: `Accesso in palestra`,
      cliente: `${accesso.cliente.nome} ${accesso.cliente.cognome}`,
      data: new Date(accesso.data_ora).toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          clientiTotali,
          clientiAttivi,
          abbonatiMese,
          ricaviMese,
          accessiOggi,
          pauseAttive,
          scadenzaProssima,
          clientiBannati,
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error('[DASHBOARD STATS] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero delle statistiche' },
      { status: 500 }
    );
  }
}
