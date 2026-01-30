import { getMessaging } from './firebase-admin';
import prisma from './prisma';

interface SendPushResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

// Send push notification to a single device
export async function sendPushToDevice(
  fcmToken: string,
  payload: NotificationPayload
): Promise<SendPushResult> {
  const messaging = getMessaging();

  if (!messaging) {
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data || {},
      android: {
        priority: 'high' as const,
        notification: {
          channelId: '24fit_default',
          icon: '@mipmap/ic_launcher',
          color: '#FFCF02',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    return { success: true, messageId: response };
  } catch (error: unknown) {
    console.error('[PUSH] Error sending to device:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// Send push notification to multiple devices
export async function sendPushToDevices(
  fcmTokens: string[],
  payload: NotificationPayload
): Promise<{ successCount: number; failureCount: number }> {
  const messaging = getMessaging();

  if (!messaging) {
    return { successCount: 0, failureCount: fcmTokens.length };
  }

  if (fcmTokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  try {
    const message = {
      tokens: fcmTokens,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data || {},
      android: {
        priority: 'high' as const,
        notification: {
          channelId: '24fit_default',
          icon: '@mipmap/ic_launcher',
          color: '#FFCF02',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('[PUSH] Error sending to devices:', error);
    return { successCount: 0, failureCount: fcmTokens.length };
  }
}

// Send push to a specific client
export async function sendPushToClient(
  clientId: number,
  payload: NotificationPayload
): Promise<SendPushResult> {
  const client = await prisma.clienti.findUnique({
    where: { id: clientId },
    select: { fcm_token: true },
  });

  if (!client?.fcm_token) {
    return { success: false, error: 'Client has no FCM token' };
  }

  return sendPushToDevice(client.fcm_token, payload);
}

// Send push to all active subscribers
export async function sendPushToAllActiveClients(
  payload: NotificationPayload
): Promise<{ successCount: number; failureCount: number }> {
  const clients = await prisma.clienti.findMany({
    where: {
      abbonamento_attivo: true,
      fcm_token: { not: null },
      stato_account: 'attivo',
    },
    select: { fcm_token: true },
  });

  const tokens = clients
    .map((c) => c.fcm_token)
    .filter((t): t is string => t !== null);

  return sendPushToDevices(tokens, payload);
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION TEMPLATES
// ═══════════════════════════════════════════════════════════════

// Subscription expiring notification
export async function sendExpiringSubscriptionPush(
  clientId: number,
  daysRemaining: number
): Promise<SendPushResult> {
  const payload: NotificationPayload = {
    title: daysRemaining <= 3 ? 'Abbonamento in scadenza!' : 'Promemoria Abbonamento',
    body:
      daysRemaining === 1
        ? 'Il tuo abbonamento scade domani! Rinnova ora per continuare ad allenarti.'
        : `Il tuo abbonamento scade tra ${daysRemaining} giorni. Rinnova per non perdere l'accesso.`,
    data: {
      type: 'subscription_expiring',
      daysRemaining: daysRemaining.toString(),
      action: 'open_subscription',
    },
  };

  return sendPushToClient(clientId, payload);
}

// Pause started notification
export async function sendPauseStartedPush(
  clientId: number,
  endDate: string
): Promise<SendPushResult> {
  return sendPushToClient(clientId, {
    title: 'Pausa Attivata',
    body: `La tua pausa è attiva. Riprenderai ad allenarti dal ${endDate}.`,
    data: {
      type: 'pause_started',
      action: 'open_subscription',
    },
  });
}

// Pause ending notification
export async function sendPauseEndingPush(
  clientId: number,
  endDate: string
): Promise<SendPushResult> {
  return sendPushToClient(clientId, {
    title: 'La tua pausa sta per terminare!',
    body: `La tua pausa termina il ${endDate}. Preparati a tornare in palestra!`,
    data: {
      type: 'pause_ending',
      action: 'open_subscription',
    },
  });
}

// Welcome notification
export async function sendWelcomePush(clientId: number, nome: string): Promise<SendPushResult> {
  return sendPushToClient(clientId, {
    title: `Benvenuto in 24FIT, ${nome}!`,
    body: 'Il tuo abbonamento è attivo. Scarica l\'app e inizia subito ad allenarti!',
    data: {
      type: 'welcome',
      action: 'open_home',
    },
  });
}

// Promotional notification
export async function sendPromoPush(
  title: string,
  body: string,
  promoId?: string
): Promise<{ successCount: number; failureCount: number }> {
  return sendPushToAllActiveClients({
    title,
    body,
    data: {
      type: 'promo',
      promoId: promoId || '',
      action: 'open_promo',
    },
  });
}

// Ban notification
export async function sendBanPush(
  clientId: number,
  permanent: boolean,
  endDate?: string
): Promise<SendPushResult> {
  return sendPushToClient(clientId, {
    title: 'Account Sospeso',
    body: permanent
      ? 'Il tuo account è stato sospeso. Contattaci per maggiori informazioni.'
      : `Il tuo account è sospeso fino al ${endDate}. Contattaci per maggiori informazioni.`,
    data: {
      type: 'account_banned',
      action: 'open_support',
    },
  });
}

// Unban notification
export async function sendUnbanPush(clientId: number): Promise<SendPushResult> {
  return sendPushToClient(clientId, {
    title: 'Account Riattivato',
    body: 'Il tuo account è stato riattivato. Puoi tornare ad allenarti!',
    data: {
      type: 'account_unbanned',
      action: 'open_home',
    },
  });
}
