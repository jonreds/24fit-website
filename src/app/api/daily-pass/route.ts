import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { DAILY_PASS } from "@/data/constants";

// Initialize Stripe lazily to ensure env vars are loaded
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  try {
    const body = await request.json();
    const { customer, clubId, clubName } = body;

    // Daily Pass price in cents
    const amount = DAILY_PASS.price * 100;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customer.email,
      metadata: {
        type: "daily_pass",
        clubId,
        clubName,
        customerFirstName: customer.nome,
        customerLastName: customer.cognome,
        customerPhone: customer.telefono,
        customerEmail: customer.email,
        customerBirthDate: customer.birthDate,
        customerBirthPlace: customer.birthPlace,
        customerFiscalCode: customer.fiscalCode,
        customerAddress: customer.address,
        customerCity: customer.city,
        customerPostalCode: customer.postalCode,
        customerProvince: customer.province,
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Daily Pass - ${clubName}`,
              description: "Accesso per un allenamento",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=daily_pass`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/daily-pass`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Daily Pass error:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione del checkout" },
      { status: 500 }
    );
  }
}
