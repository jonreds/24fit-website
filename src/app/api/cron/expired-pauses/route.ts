import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPauseConfirmEmail, formatDateIT } from '@/lib/email';
import { sendPauseEndingPush } from '@/lib/push-notifications';

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
    now.setHours(0, 0, 0, 0);

    const results = {
      pausesEnded: 0,
      emailsSent: 0,
      pushSent: 0,
      errors: 0,
    };

    // Find all clients with active pause that has ended
    const clientsWithExpiredPause = await prisma.clienti.findMany({
      where: {
        pausa_attiva: true,
        pausa_data_fine: {
          lt: now, // Pause end date is before today
        },
      },
    });

    for (const client of clientsWithExpiredPause) {
      try {
        // Calculate pause duration
        const pauseStart = client.pausa_data_inizio
          ? new Date(client.pausa_data_inizio)
          : new Date();
        const pauseEnd = client.pausa_data_fine
          ? new Date(client.pausa_data_fine)
          : new Date();
        const pauseDays = Math.ceil(
          (pauseEnd.getTime() - pauseStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Get the remaining pause days
        const giorniRimanenti = (client.giorni_pausa_totali || 0) - (client.giorni_pausa_usati || 0);

        // End the pause
        await prisma.clienti.update({
          where: { id: client.id },
          data: {
            pausa_attiva: false,
            pausa_data_inizio: null,
            pausa_data_fine: null,
          },
        });

        results.pausesEnded++;

        // Send email notification
        try {
          await sendPauseConfirmEmail({
            to: client.email,
            nome: client.nome || 'Cliente',
            dataInizio: formatDateIT(pauseStart),
            dataFine: formatDateIT(pauseEnd),
            giorniPausa: pauseDays,
            giorniRimanenti: giorniRimanenti,
            nuovaScadenzaAbbonamento: client.abbonamento_scadenza
              ? formatDateIT(new Date(client.abbonamento_scadenza))
              : '-',
            tipo: 'end',
          });
          results.emailsSent++;
        } catch (emailError) {
          console.error(`[CRON] Error sending pause end email to ${client.email}:`, emailError);
          results.errors++;
        }

        // Send push notification
        if (client.fcm_token && client.push_enabled) {
          try {
            const pushResult = await sendPauseEndingPush(
              client.id,
              formatDateIT(pauseEnd)
            );
            if (pushResult.success) {
              results.pushSent++;
            }
          } catch (pushError) {
            console.error(`[CRON] Error sending pause end push to client ${client.id}:`, pushError);
          }
        }
      } catch (error) {
        console.error(`[CRON] Error processing expired pause for client ${client.id}:`, error);
        results.errors++;
      }
    }

    // Also send "pause ending soon" notifications (ending tomorrow)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const clientsWithPauseEndingTomorrow = await prisma.clienti.findMany({
      where: {
        pausa_attiva: true,
        pausa_data_fine: {
          gte: now,
          lt: tomorrow,
        },
        fcm_token: { not: null },
        push_enabled: true,
      },
    });

    for (const client of clientsWithPauseEndingTomorrow) {
      try {
        await sendPauseEndingPush(
          client.id,
          client.pausa_data_fine
            ? formatDateIT(new Date(client.pausa_data_fine))
            : 'domani'
        );
      } catch (error) {
        console.error(`[CRON] Error sending pause ending push to client ${client.id}:`, error);
      }
    }

    console.log('[CRON expired-pauses] Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Expired pauses processed',
      data: {
        ...results,
        pauseEndingTomorrowNotified: clientsWithPauseEndingTomorrow.length,
      },
    });
  } catch (error) {
    console.error('[CRON expired-pauses] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Cron job failed' },
      { status: 500 }
    );
  }
}
