import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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

    // Delete expired and used password reset tokens
    const deletedTokens = await prisma.password_reset_tokens.deleteMany({
      where: {
        OR: [
          { expires_at: { lt: now } }, // Expired
          { used: true }, // Already used
        ],
      },
    });

    // Optionally: Deactivate subscriptions that have expired
    // (if you want automatic deactivation)
    const expiredSubscriptions = await prisma.clienti.updateMany({
      where: {
        abbonamento_attivo: true,
        abbonamento_scadenza: { lt: now },
        pausa_attiva: false, // Don't deactivate if on pause
      },
      data: {
        abbonamento_attivo: false,
      },
    });

    const results = {
      deletedTokens: deletedTokens.count,
      deactivatedSubscriptions: expiredSubscriptions.count,
    };

    console.log('[CRON cleanup-tokens] Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      data: results,
    });
  } catch (error) {
    console.error('[CRON cleanup-tokens] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Cron job failed' },
      { status: 500 }
    );
  }
}
