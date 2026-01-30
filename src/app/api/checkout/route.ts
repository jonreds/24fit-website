import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

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
    const {
      club,
      plan,
      customer,
    } = body;

    // Il prezzo totale arriva già calcolato dall'API (prezzo_totale = prezzo + quota_iscrizione)
    const totalAmount = plan.price * 100; // Convert to cents - già include tutto

    // Hash password before storing in metadata (security best practice)
    let hashedPassword = "";
    if (customer.password) {
      hashedPassword = await bcrypt.hash(customer.password, 10);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "paypal", "klarna"],
      mode: "payment",
      customer_email: customer.email,
      metadata: {
        type: "subscription", // Distinguish from daily_pass
        clubId: club.id,
        clubName: club.name,
        contractId: plan.id,
        contractName: plan.name,
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        customerPhone: `${customer.phonePrefix}${customer.phone}`,
        customerBirthDate: customer.birthDate,
        customerBirthPlace: customer.birthPlace || "",
        customerFiscalCode: customer.fiscalCode,
        customerAddress: customer.address,
        customerCity: customer.city,
        customerPostalCode: customer.postalCode,
        customerProvince: customer.province,
        customerPasswordHash: hashedPassword, // Hashed password for client creation
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Abbonamento ${plan.name} - ${club.name}`,
              description: `Abbonamento + iscrizione`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/abbonamenti`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione del checkout" },
      { status: 500 }
    );
  }
}
