import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken, ROLE_HIERARCHY } from '@/lib/auth';
import {
  sendPushToClient,
  sendPushToAllActiveClients,
  sendPushToDevices,
} from '@/lib/push-notifications';

export const dynamic = 'force-dynamic';

// POST - Send push notification
export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only admin+ can send push notifications
  if (ROLE_HIERARCHY[auth.ruolo as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY.admin) {
    return NextResponse.json(
      { success: false, message: 'Permessi insufficienti' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { type, title, body: messageBody, clientId, clientIds, imageUrl } = body;

    if (!title || !messageBody) {
      return NextResponse.json(
        { success: false, message: 'Titolo e messaggio sono obbligatori' },
        { status: 400 }
      );
    }

    const payload = {
      title,
      body: messageBody,
      imageUrl,
      data: {
        type: type || 'custom',
        sentBy: `${auth.ruolo}:${auth.userId}`,
      },
    };

    let result;

    if (type === 'broadcast') {
      // Send to all active clients
      result = await sendPushToAllActiveClients(payload);
      return NextResponse.json({
        success: true,
        message: `Notifica inviata a ${result.successCount} clienti (${result.failureCount} fallite)`,
        data: result,
      });
    } else if (clientId) {
      // Send to single client
      result = await sendPushToClient(clientId, payload);
      return NextResponse.json({
        success: result.success,
        message: result.success
          ? 'Notifica inviata'
          : result.error || 'Errore nell\'invio',
        data: result,
      });
    } else if (clientIds && Array.isArray(clientIds)) {
      // Send to multiple specific clients
      const clients = await prisma.clienti.findMany({
        where: {
          id: { in: clientIds },
          fcm_token: { not: null },
        },
        select: { fcm_token: true },
      });

      const tokens = clients
        .map((c) => c.fcm_token)
        .filter((t): t is string => t !== null);

      result = await sendPushToDevices(tokens, payload);
      return NextResponse.json({
        success: true,
        message: `Notifica inviata a ${result.successCount} clienti (${result.failureCount} fallite)`,
        data: result,
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Specifica clientId, clientIds o type=broadcast' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[DASHBOARD PUSH] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'invio della notifica' },
      { status: 500 }
    );
  }
}

// GET - Get push stats
export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const [totalClients, clientsWithToken, clientsWithPushEnabled] = await Promise.all([
      prisma.clienti.count({
        where: { abbonamento_attivo: true },
      }),
      prisma.clienti.count({
        where: {
          abbonamento_attivo: true,
          fcm_token: { not: null },
        },
      }),
      prisma.clienti.count({
        where: {
          abbonamento_attivo: true,
          fcm_token: { not: null },
          push_enabled: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalActiveClients: totalClients,
        clientsWithToken,
        clientsWithPushEnabled,
        reachPercentage:
          totalClients > 0
            ? Math.round((clientsWithPushEnabled / totalClients) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error('[DASHBOARD PUSH STATS] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero delle statistiche' },
      { status: 500 }
    );
  }
}
