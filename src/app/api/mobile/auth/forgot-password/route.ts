import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://24fit.it';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email obbligatoria' },
        { status: 400 }
      );
    }

    // Find client by email
    const client = await prisma.clienti.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, nome: true, email: true, stato_account: true },
    });

    // Always return success to prevent email enumeration
    if (!client || client.stato_account === 'bannato') {
      return NextResponse.json({
        success: true,
        message: 'Se l\'email esiste, riceverai un link per reimpostare la password.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Invalidate any existing tokens for this client
    await prisma.password_reset_tokens.updateMany({
      where: {
        cliente_id: client.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Store the new token hash
    await prisma.password_reset_tokens.create({
      data: {
        cliente_id: client.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });

    // Create reset URL
    const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(client.email)}`;

    // Send email
    await resend.emails.send({
      from: '24FIT <noreply@24fit.it>',
      to: client.email,
      subject: 'Reset Password - 24FIT',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password 24FIT</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #FFCF02; padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 32px; font-weight: 800;">24FIT</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px; font-weight: 700;">
                Ciao ${client.nome}!
              </h2>

              <p style="margin: 0 0 24px; color: #666666; font-size: 16px; line-height: 1.6;">
                Hai richiesto di reimpostare la password del tuo account 24FIT.
              </p>

              <p style="margin: 0 0 24px; color: #666666; font-size: 16px; line-height: 1.6;">
                Clicca il pulsante qui sotto per creare una nuova password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px;">
                    <a href="${resetUrl}" style="display: inline-block; background-color: #FFCF02; color: #1a1a1a; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 700;">
                      Reimposta Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0; color: #999999; font-size: 14px; line-height: 1.6;">
                Il link scadrà tra 1 ora per motivi di sicurezza.
              </p>

              <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6;">
                Se non hai richiesto il reset della password, ignora questa email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 8px; color: #ffffff; font-size: 14px; font-weight: 600;">
                24FIT - La libertà di essere fit
              </p>
              <p style="margin: 0; color: #888888; font-size: 12px;">
                © 2025 24FIT SRL | P.IVA 02700470202
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    console.log(`[FORGOT PASSWORD] Reset email sent to: ${client.email}`);

    return NextResponse.json({
      success: true,
      message: 'Se l\'email esiste, riceverai un link per reimpostare la password.',
    });
  } catch (error) {
    console.error('[FORGOT PASSWORD] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'invio dell\'email' },
      { status: 500 }
    );
  }
}
