import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendExpiringSubscriptionPush } from '@/lib/push-notifications';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET || 'cron-secret-24fit';

export async function GET(request: NextRequest) {
  // Verify cron secret
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
      skippedNoToken: 0,
    };

    // Get dates for 7, 3, and 1 day from now
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);
    in7Days.setHours(0, 0, 0, 0);

    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);
    in3Days.setHours(0, 0, 0, 0);

    const in1Day = new Date(now);
    in1Day.setDate(in1Day.getDate() + 1);
    in1Day.setHours(0, 0, 0, 0);

    const after7Days = new Date(in7Days);
    after7Days.setHours(23, 59, 59, 999);

    const after3Days = new Date(in3Days);
    after3Days.setHours(23, 59, 59, 999);

    const tomorrow = new Date(in1Day);
    tomorrow.setHours(23, 59, 59, 999);

    // Base query conditions
    const baseConditions = {
      abbonamento_attivo: true,
      stato_account: 'attivo',
      pausa_attiva: false,
      push_enabled: true,
      fcm_token: { not: null },
    };

    // Find clients expiring in 7 days
    const expiring7Days = await prisma.clienti.findMany({
      where: {
        ...baseConditions,
        abbonamento_scadenza: {
          gte: in7Days,
          lte: after7Days,
        },
      },
      select: { id: true, fcm_token: true },
    });

    // Find clients expiring in 3 days
    const expiring3Days = await prisma.clienti.findMany({
      where: {
        ...baseConditions,
        abbonamento_scadenza: {
          gte: in3Days,
          lte: after3Days,
        },
      },
      select: { id: true, fcm_token: true },
    });

    // Find clients expiring tomorrow
    const expiring1Day = await prisma.clienti.findMany({
      where: {
        ...baseConditions,
        abbonamento_scadenza: {
          gte: in1Day,
          lte: tomorrow,
        },
      },
      select: { id: true, fcm_token: true },
    });

    // Send push for 7 days expiry
    for (const client of expiring7Days) {
      if (!client.fcm_token) {
        results.skippedNoToken++;
        continue;
      }
      try {
        const result = await sendExpiringSubscriptionPush(client.id, 7);
        if (result.success) {
          results.sent7Days++;
        } else {
          results.errors++;
        }
      } catch (error) {
        console.error(`[CRON PUSH] Error sending 7-day push to client ${client.id}:`, error);
        results.errors++;
      }
    }

    // Send push for 3 days expiry
    for (const client of expiring3Days) {
      if (!client.fcm_token) {
        results.skippedNoToken++;
        continue;
      }
      try {
        const result = await sendExpiringSubscriptionPush(client.id, 3);
        if (result.success) {
          results.sent3Days++;
        } else {
          results.errors++;
        }
      } catch (error) {
        console.error(`[CRON PUSH] Error sending 3-day push to client ${client.id}:`, error);
        results.errors++;
      }
    }

    // Send push for 1 day expiry
    for (const client of expiring1Day) {
      if (!client.fcm_token) {
        results.skippedNoToken++;
        continue;
      }
      try {
        const result = await sendExpiringSubscriptionPush(client.id, 1);
        if (result.success) {
          results.sent1Day++;
        } else {
          results.errors++;
        }
      } catch (error) {
        console.error(`[CRON PUSH] Error sending 1-day push to client ${client.id}:`, error);
        results.errors++;
      }
    }

    console.log('[CRON expiring-push] Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Expiring subscription push notifications sent',
      data: results,
    });
  } catch (error) {
    console.error('[CRON expiring-push] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Cron job failed' },
      { status: 500 }
    );
  }
}
