import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, newPassword } = body;

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token, email e nuova password sono obbligatori' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'La password deve avere almeno 8 caratteri' },
        { status: 400 }
      );
    }

    // Find client by email
    const client = await prisma.clienti.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, nome: true, email: true },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Link non valido o scaduto' },
        { status: 400 }
      );
    }

    // Hash the provided token and look for it in the database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.password_reset_tokens.findFirst({
      where: {
        cliente_id: client.id,
        token_hash: tokenHash,
        used: false,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { success: false, message: 'Link non valido o scaduto' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.clienti.update({
        where: { id: client.id },
        data: { password: hashedPassword },
      }),
      prisma.password_reset_tokens.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    console.log(`[RESET PASSWORD] Password reset successful for: ${client.email}`);

    return NextResponse.json({
      success: true,
      message: 'Password reimpostata con successo. Puoi ora accedere con la nuova password.',
    });
  } catch (error) {
    console.error('[RESET PASSWORD] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel reset della password' },
      { status: 500 }
    );
  }
}
