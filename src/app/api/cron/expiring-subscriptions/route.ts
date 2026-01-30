import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSubscriptionExpiringEmail, formatDateIT } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET || 'cron-secret-24fit';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const now = new Date();
    const results = {
      sent7Days: 0,
      sent3Days: 0,
      sent1Day: 0,
      errors: 0,
    };

    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);
    in7Days.setHours(0, 0, 0, 0);

    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);
    in3Days.setHours(0, 0, 0, 0);

    const in1Day = new Date(now);
    in1Day.setDate(in1Day.getDate() + 1);
    in1Day.setHours(0, 0, 0, 0);

    const tomorrow = new Date(in1Day);
    tomorrow.setHours(23, 59, 59, 999);

    const after7Days = new Date(in7Days);
    after7Days.setHours(23, 59, 59, 999);

    const after3Days = new Date(in3Days);
    after3Days.setHours(23, 59, 59, 999);

    const expiring7Days = await prisma.clienti.findMany({
      where: {
        abbonamento_attivo: true,
        stato_account: 'attivo',
        pausa_attiva: false,
        abbonamento_scadenza: {
          gte: in7Days,
          lte: after7Days,
        },
      },
    });

    const expiring3Days = await prisma.clienti.findMany({
      where: {
        abbonamento_attivo: true,
        stato_account: 'attivo',
        pausa_attiva: false,
        abbonamento_scadenza: {
          gte: in3Days,
          lte: after3Days,
        },
      },
    });

    const expiring1Day = await prisma.clienti.findMany({
      where: {
        abbonamento_attivo: true,
        stato_account: 'attivo',
        pausa_attiva: false,
        abbonamento_scadenza: {
          gte: in1Day,
          lte: tomorrow,
        },
      },
    });

    for (const client of expiring7Days) {
      try {
        await sendSubscriptionExpiringEmail({
          to: client.email,
          nome: client.nome || 'Cliente',
          pianoNome: client.abbonamento_tipo || 'Abbonamento',
          dataScadenza: client.abbonamento_scadenza
            ? formatDateIT(new Date(client.abbonamento_scadenza))
            : '-',
          giorniRimanenti: 7,
        });
        results.sent7Days++;
      } catch (error) {
        console.error(`[CRON] Error sending 7-day email to ${client.email}:`, error);
        results.errors++;
      }
    }

    for (const client of expiring3Days) {
      try {
        await sendSubscriptionExpiringEmail({
          to: client.email,
          nome: client.nome || 'Cliente',
          pianoNome: client.abbonamento_tipo || 'Abbonamento',
          dataScadenza: client.abbonamento_scadenza
            ? formatDateIT(new Date(client.abbonamento_scadenza))
            : '-',
          giorniRimanenti: 3,
        });
        results.sent3Days++;
      } catch (error) {
        console.error(`[CRON] Error sending 3-day email to ${client.email}:`, error);
        results.errors++;
      }
    }

    for (const client of expiring1Day) {
      try {
        await sendSubscriptionExpiringEmail({
          to: client.email,
          nome: client.nome || 'Cliente',
          pianoNome: client.abbonamento_tipo || 'Abbonamento',
          dataScadenza: client.abbonamento_scadenza
            ? formatDateIT(new Date(client.abbonamento_scadenza))
            : '-',
          giorniRimanenti: 1,
        });
        results.sent1Day++;
      } catch (error) {
        console.error(`[CRON] Error sending 1-day email to ${client.email}:`, error);
        results.errors++;
      }
    }

    console.log('[CRON expiring-subscriptions] Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Expiring subscription emails sent',
      data: results,
    });
  } catch (error) {
    console.error('[CRON expiring-subscriptions] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Cron job failed' },
      { status: 500 }
    );
  }
}
