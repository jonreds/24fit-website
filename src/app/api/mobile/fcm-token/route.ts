import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyClientToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Register/Update FCM token
export async function POST(request: NextRequest) {
  const auth = await verifyClientToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { fcmToken } = body;

    if (!fcmToken || typeof fcmToken !== 'string') {
      return NextResponse.json(
        { success: false, message: 'FCM token non valido' },
        { status: 400 }
      );
    }

    await prisma.clienti.update({
      where: { id: auth.clientId },
      data: { fcm_token: fcmToken },
    });

    return NextResponse.json({
      success: true,
      message: 'Token registrato',
    });
  } catch (error) {
    console.error('[FCM TOKEN] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nella registrazione del token' },
      { status: 500 }
    );
  }
}

// DELETE - Remove FCM token (logout)
export async function DELETE(request: NextRequest) {
  const auth = await verifyClientToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    await prisma.clienti.update({
      where: { id: auth.clientId },
      data: { fcm_token: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Token rimosso',
    });
  } catch (error) {
    console.error('[FCM TOKEN DELETE] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nella rimozione del token' },
      { status: 500 }
    );
  }
}
