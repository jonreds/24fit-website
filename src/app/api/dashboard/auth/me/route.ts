import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const user = await prisma.users.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        nome: true,
        cognome: true,
        ruolo: true,
        attivo: true,
        ultimoAccesso: true,
      },
    });

    if (!user || !user.attivo) {
      return NextResponse.json(
        { success: false, message: 'Utente non trovato o disattivato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('[DASHBOARD AUTH ME] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero dati utente' },
      { status: 500 }
    );
  }
}
