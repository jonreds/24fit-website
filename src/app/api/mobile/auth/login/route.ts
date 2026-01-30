import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateClientToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email e password sono obbligatori' },
        { status: 400 }
      );
    }

    // Find client by email
    const client = await prisma.clienti.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        nome: true,
        cognome: true,
        telefono: true,
        avatar: true,
        stato_account: true,
        ban_motivo: true,
        ban_data_fine: true,
        abbonamento_attivo: true,
        abbonamento_tipo: true,
        abbonamento_scadenza: true,
        onboarding_completato: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Email o password non validi' },
        { status: 401 }
      );
    }

    // Check if account is banned
    if (client.stato_account === 'bannato') {
      const isTempBan = client.ban_data_fine && new Date(client.ban_data_fine) > new Date();
      const isPermanentBan = client.stato_account === 'bannato' && !client.ban_data_fine;

      if (isPermanentBan) {
        return NextResponse.json(
          {
            success: false,
            message: 'Il tuo account è stato sospeso permanentemente.',
            reason: client.ban_motivo,
          },
          { status: 403 }
        );
      }

      if (isTempBan) {
        return NextResponse.json(
          {
            success: false,
            message: `Il tuo account è sospeso fino al ${new Date(client.ban_data_fine!).toLocaleDateString('it-IT')}`,
            reason: client.ban_motivo,
            banned_until: client.ban_data_fine,
          },
          { status: 403 }
        );
      }

      // Ban expired, reactivate account
      await prisma.clienti.update({
        where: { id: client.id },
        data: { stato_account: 'attivo', ban_motivo: null, ban_data_inizio: null, ban_data_fine: null },
      });
    }

    // Verify password
    if (!client.password) {
      return NextResponse.json(
        { success: false, message: 'Password non impostata. Richiedi un reset della password.' },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, client.password);
    if (!validPassword) {
      return NextResponse.json(
        { success: false, message: 'Email o password non validi' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateClientToken(client.id, client.email);

    // Update last access
    await prisma.clienti.update({
      where: { id: client.id },
      data: { ultimo_accesso: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        client: {
          id: client.id,
          email: client.email,
          nome: client.nome,
          cognome: client.cognome,
          telefono: client.telefono,
          avatar: client.avatar,
          abbonamento_attivo: client.abbonamento_attivo,
          abbonamento_tipo: client.abbonamento_tipo,
          abbonamento_scadenza: client.abbonamento_scadenza,
          onboarding_completato: client.onboarding_completato,
        },
      },
    });
  } catch (error) {
    console.error('[MOBILE LOGIN] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il login' },
      { status: 500 }
    );
  }
}
