import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { verifyAdminToken, ROLE_HIERARCHY } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://24fit.it';

// POST - Password management actions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only admin+ can manage passwords
  if (ROLE_HIERARCHY[auth.ruolo as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY.admin) {
    return NextResponse.json(
      { success: false, message: 'Permessi insufficienti' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
      return NextResponse.json(
        { success: false, message: 'ID cliente non valido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, newPassword } = body;

    const client = await prisma.clienti.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        email: true,
        nome: true,
        cognome: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    if (action === 'send_reset_email') {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 86400000); // 24 hours for admin-sent links

      // Invalidate existing tokens
      await prisma.password_reset_tokens.updateMany({
        where: {
          cliente_id: client.id,
          used: false,
        },
        data: { used: true },
      });

      // Store new token
      await prisma.password_reset_tokens.create({
        data: {
          cliente_id: client.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
      });

      const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(client.email)}`;

      // Send email
      await resend.emails.send({
        from: '24FIT <noreply@24fit.it>',
        to: client.email,
        subject: 'Reset Password Richiesto - 24FIT',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Ciao ${client.nome},</h2>
            <p>Un amministratore ha richiesto il reset della tua password.</p>
            <p>Clicca il link qui sotto per impostare una nuova password:</p>
            <p><a href="${resetUrl}" style="background: #FFCF02; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reimposta Password</a></p>
            <p style="color: #666; font-size: 12px;">Il link scade tra 24 ore.</p>
          </div>
        `,
      });

      // Log action
      await prisma.note_cliente.create({
        data: {
          cliente_id: clientId,
          autore_id: auth.userId,
          autore_ruolo: auth.ruolo,
          contenuto: 'Email di reset password inviata',
          tipo: 'nota',
          visibile_a: 'admin+',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Email di reset inviata a ${client.email}`,
      });

    } else if (action === 'get_reset_link') {
      // Generate reset link to copy (for elderly/phone support)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 86400000); // 24 hours

      // Invalidate existing tokens
      await prisma.password_reset_tokens.updateMany({
        where: {
          cliente_id: client.id,
          used: false,
        },
        data: { used: true },
      });

      // Store new token
      await prisma.password_reset_tokens.create({
        data: {
          cliente_id: client.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
      });

      const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(client.email)}`;

      // Log action
      await prisma.note_cliente.create({
        data: {
          cliente_id: clientId,
          autore_id: auth.userId,
          autore_ruolo: auth.ruolo,
          contenuto: 'Link reset password generato manualmente',
          tipo: 'nota',
          visibile_a: 'admin+',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Link generato (valido 24 ore)',
        data: {
          resetUrl,
          expiresAt,
        },
      });

    } else if (action === 'set_password') {
      // Directly set a new password (only superadmin)
      if (auth.ruolo !== 'superadmin') {
        return NextResponse.json(
          { success: false, message: 'Solo i superadmin possono impostare password direttamente' },
          { status: 403 }
        );
      }

      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json(
          { success: false, message: 'La password deve avere almeno 8 caratteri' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.clienti.update({
        where: { id: clientId },
        data: { password: hashedPassword },
      });

      // Invalidate all reset tokens
      await prisma.password_reset_tokens.updateMany({
        where: {
          cliente_id: client.id,
          used: false,
        },
        data: { used: true },
      });

      // Log action
      await prisma.note_cliente.create({
        data: {
          cliente_id: clientId,
          autore_id: auth.userId,
          autore_ruolo: auth.ruolo,
          contenuto: 'Password impostata manualmente da superadmin',
          tipo: 'importante',
          visibile_a: 'admin+',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Password impostata con successo',
      });

    } else {
      return NextResponse.json(
        { success: false, message: 'Azione non valida. Usa "send_reset_email", "get_reset_link" o "set_password"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[DASHBOARD PASSWORD] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nella gestione password' },
      { status: 500 }
    );
  }
}
