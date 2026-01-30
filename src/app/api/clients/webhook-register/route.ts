import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Verify webhook API key
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.WEBHOOK_API_KEY;

  if (!expectedKey) {
    console.warn('[WEBHOOK-REGISTER] WEBHOOK_API_KEY not configured');
    return false;
  }

  return apiKey === expectedKey;
}

export async function POST(request: NextRequest) {
  // Verify API key
  if (!verifyApiKey(request)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      email,
      passwordHash, // Already hashed password from checkout
      nome,
      cognome,
      telefono,
      data_nascita,
      luogo_nascita,
      codice_fiscale,
      indirizzo,
      citta,
      cap,
      provincia,
      abbonamento_tipo,
      abbonamento_scadenza,
      stripe_customer_id,
      stripe_payment_id,
    } = body;

    // Validate required fields
    if (!email || !nome || !cognome) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: email, nome, cognome' },
        { status: 400 }
      );
    }

    // Check if client already exists
    const existingClient = await prisma.clienti.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Calculate pause days based on subscription type
    let giorniPausaTotali = 0;
    if (abbonamento_tipo) {
      const tipo = abbonamento_tipo.toLowerCase();
      if (tipo.includes('12') || tipo.includes('annuale')) {
        giorniPausaTotali = 30;
      } else if (tipo.includes('6')) {
        giorniPausaTotali = 14;
      } else if (tipo.includes('3')) {
        giorniPausaTotali = 7;
      }
    }

    if (existingClient) {
      // Update existing client
      const updatedClient = await prisma.clienti.update({
        where: { id: existingClient.id },
        data: {
          // Only update password if provided and client doesn't have one
          ...(passwordHash && !existingClient.password && { password: passwordHash }),
          // Update subscription info
          abbonamento_attivo: true,
          abbonamento_tipo,
          abbonamento_scadenza: abbonamento_scadenza ? new Date(abbonamento_scadenza) : null,
          giorni_pausa_totali: giorniPausaTotali,
          giorni_pausa_usati: 0, // Reset for new subscription
          stripe_customer_id: stripe_customer_id || existingClient.stripe_customer_id,
          stripe_payment_id,
        },
      });

      console.log(`[WEBHOOK-REGISTER] Updated client: ${updatedClient.id} (${email})`);

      return NextResponse.json({
        success: true,
        data: {
          id: updatedClient.id,
          isNew: false,
        },
      });
    }

    // Create new client
    const newClient = await prisma.clienti.create({
      data: {
        email: email.toLowerCase(),
        password: passwordHash || null,
        nome,
        cognome,
        telefono,
        data_nascita: data_nascita ? new Date(data_nascita) : null,
        luogo_nascita,
        codice_fiscale: codice_fiscale?.toUpperCase(),
        indirizzo,
        citta,
        cap,
        provincia: provincia?.toUpperCase(),
        abbonamento_attivo: true,
        abbonamento_tipo,
        abbonamento_scadenza: abbonamento_scadenza ? new Date(abbonamento_scadenza) : null,
        giorni_pausa_totali: giorniPausaTotali,
        stripe_customer_id,
        stripe_payment_id,
      },
    });

    console.log(`[WEBHOOK-REGISTER] Created new client: ${newClient.id} (${email})`);

    return NextResponse.json({
      success: true,
      data: {
        id: newClient.id,
        isNew: true,
      },
    });
  } catch (error) {
    console.error('[WEBHOOK-REGISTER] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
