import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { promises as fs } from "fs";
import path from "path";
import {
  isFICConfigured,
  create24FITInvoice,
  type CustomerData,
  type OrderItem,
} from "@/lib/fattureincloud";

// Initialize Stripe lazily to ensure env vars are loaded
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Initialize Resend lazily
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Stripe webhook secret (from Stripe Dashboard)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// API configuration for creating clients
const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://localhost:3001";
const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY || "";

// Helper to create client in the database via API
async function createClientInDatabase(orderData: OrderData): Promise<{ success: boolean; clientId?: number }> {
  if (!WEBHOOK_API_KEY) {
    console.log("WEBHOOK_API_KEY not configured, skipping client creation");
    return { success: false };
  }

  try {
    // Calculate subscription end date based on contract type
    let subscriptionEndDate: string | null = null;
    if (orderData.type !== "daily_pass") {
      // Extract duration from contract name (e.g., "3 Mesi", "6 Mesi", "12 Mesi")
      const durationMatch = orderData.contractName.match(/(\d+)\s*mes/i);
      if (durationMatch) {
        const months = parseInt(durationMatch[1], 10);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);
        subscriptionEndDate = endDate.toISOString().split("T")[0];
      }
    }

    const response = await fetch(`${API_INTERNAL_URL}/api/clients/webhook-register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": WEBHOOK_API_KEY,
      },
      body: JSON.stringify({
        email: orderData.email,
        passwordHash: orderData.passwordHash || null, // Hashed password from checkout
        nome: orderData.firstName,
        cognome: orderData.lastName,
        telefono: orderData.phone,
        data_nascita: orderData.birthDate,
        luogo_nascita: orderData.birthPlace,
        codice_fiscale: orderData.fiscalCode,
        indirizzo: orderData.address,
        citta: orderData.city,
        cap: orderData.postalCode,
        provincia: orderData.province,
        abbonamento_tipo: orderData.type === "daily_pass" ? "daily_pass" : orderData.contractName,
        abbonamento_scadenza: subscriptionEndDate,
        stripe_customer_id: orderData.stripeCustomerId || null,
        stripe_payment_id: orderData.paymentId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`Client created/updated in database: ${result.data.id} (${result.data.isNew ? "new" : "updated"})`);
      return { success: true, clientId: result.data.id };
    } else {
      console.error("Failed to create client:", result.message);
      return { success: false };
    }
  } catch (error) {
    console.error("Error calling client API:", error);
    return { success: false };
  }
}

// Notification settings file (same as notifiche-email API)
const NOTIFICATION_SETTINGS_FILE = path.join(process.cwd(), "notification-email-settings.json");

// Default notification settings
const DEFAULT_NOTIFICATION_SETTINGS = {
  nuoviAbbonamenti: {
    abilitato: true,
    destinatari: ["info@24fit.it", "luca@24fit.it"],
  },
  dailyPass: {
    abilitato: true,
    destinatari: ["info@24fit.it", "luca@24fit.it"],
  },
};

// Helper to get notification recipients dynamically
async function getNotificationRecipients(type: "nuoviAbbonamenti" | "dailyPass"): Promise<string[]> {
  try {
    const data = await fs.readFile(NOTIFICATION_SETTINGS_FILE, "utf-8");
    const settings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(data) };
    const config = settings[type];
    return config.abilitato ? config.destinatari : [];
  } catch {
    // File doesn't exist, use defaults
    const config = DEFAULT_NOTIFICATION_SETTINGS[type];
    return config.abilitato ? config.destinatari : [];
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const resend = getResend();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Extract customer data from metadata
    const metadata = session.metadata || {};
    const customerEmail = session.customer_email || "";
    const orderType = metadata.type || "subscription"; // "subscription" or "daily_pass"

    const customerData = {
      email: customerEmail,
      firstName: metadata.customerFirstName || "",
      lastName: metadata.customerLastName || "",
      phone: metadata.customerPhone || "",
      birthDate: metadata.customerBirthDate || "",
      birthPlace: metadata.customerBirthPlace || "",
      fiscalCode: metadata.customerFiscalCode || "",
      address: metadata.customerAddress || "",
      city: metadata.customerCity || "",
      postalCode: metadata.customerPostalCode || "",
      province: metadata.customerProvince || "",
      clubId: metadata.clubId || "",
      clubName: metadata.clubName || "",
      contractId: metadata.contractId || "",
      contractName: metadata.contractName || "",
      passwordHash: metadata.customerPasswordHash || "", // Hashed password from checkout
    };

    // Order data for notifications
    const orderData: OrderData = {
      ...customerData,
      type: orderType,
      amountTotal: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
      currency: session.currency || "eur",
      paymentId: session.payment_intent as string || session.id,
      createdAt: new Date().toISOString(),
      stripeCustomerId: session.customer as string || undefined,
    };

    // ═══════════════════════════════════════════════════════════════
    // CLIENT CREATION (Database via API)
    // ═══════════════════════════════════════════════════════════════
    try {
      console.log("Creating client in database for:", orderData.email);
      const clientResult = await createClientInDatabase(orderData);
      if (clientResult.success && clientResult.clientId) {
        orderData.clientId = clientResult.clientId;
        console.log("Client created successfully:", clientResult.clientId);
      }
    } catch (clientError) {
      console.error("Failed to create client:", clientError);
      // Don't fail the webhook - client creation error is logged but not critical
    }

    // ═══════════════════════════════════════════════════════════════
    // INVOICE GENERATION (Fatture in Cloud)
    // ═══════════════════════════════════════════════════════════════
    if (isFICConfigured() && orderData.fiscalCode) {
      try {
        console.log("Creating invoice for order:", orderData.paymentId);

        const customer: CustomerData = {
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          fiscalCode: orderData.fiscalCode,
          address: orderData.address,
          postalCode: orderData.postalCode,
          city: orderData.city,
          province: orderData.province,
        };

        const items: OrderItem[] = [
          {
            name: orderType === "daily_pass" ? "Daily Pass" : orderData.contractName,
            description: `${orderData.clubName} - ${orderType === "daily_pass" ? "Ingresso giornaliero" : "Abbonamento palestra"}`,
            price: orderData.amountTotal, // Already in EUR (not cents)
            quantity: 1,
          },
        ];

        const invoiceResult = await create24FITInvoice(customer, items, {
          paymentDate: new Date().toISOString().split("T")[0],
          notes: `Ordine ${orderData.paymentId}`,
          sendToSDI: true, // Auto-send to Sistema di Interscambio
        });

        // Update order data with invoice info
        orderData.invoiceId = invoiceResult.invoiceId;
        orderData.invoiceNumber = invoiceResult.invoiceNumber;
        orderData.invoicePdfUrl = invoiceResult.pdfUrl;

        console.log("Invoice created:", invoiceResult.invoiceNumber);
      } catch (invoiceError) {
        console.error("Failed to create invoice:", invoiceError);
        // Don't fail the webhook - invoice creation is not critical
      }
    } else if (!isFICConfigured()) {
      console.log("Fatture in Cloud not configured, skipping invoice creation");
    } else if (!orderData.fiscalCode) {
      console.log("No fiscal code provided, skipping invoice creation");
    }

    // ═══════════════════════════════════════════════════════════════
    // EMAIL NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════
    if (orderType === "daily_pass") {
      // Daily Pass: send confirmation emails
      try {
        console.log("Sending Daily Pass confirmation email to:", orderData.email);
        await sendDailyPassConfirmationEmail(resend, orderData);
        console.log("Daily Pass confirmation email sent successfully");
      } catch (emailError) {
        console.error("Failed to send daily pass email:", emailError);
      }

      // Get dynamic recipients for daily pass notifications
      const dailyPassRecipients = await getNotificationRecipients("dailyPass");
      console.log("Daily Pass admin recipients:", dailyPassRecipients);
      if (dailyPassRecipients.length > 0) {
        try {
          console.log("Sending Daily Pass admin notification to:", dailyPassRecipients);
          await sendDailyPassAdminNotificationEmail(resend, orderData, dailyPassRecipients);
          console.log("Daily Pass admin notification sent successfully");
        } catch (emailError) {
          console.error("Failed to send daily pass admin notification:", emailError);
        }
      }
    } else {
      // Subscription: send welcome emails
      try {
        console.log("Sending welcome email to:", orderData.email);
        await sendWelcomeEmail(resend, orderData);
        console.log("Welcome email sent successfully");
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      // Get dynamic recipients for subscription notifications
      const subscriptionRecipients = await getNotificationRecipients("nuoviAbbonamenti");
      console.log("Subscription admin recipients:", subscriptionRecipients);
      if (subscriptionRecipients.length > 0) {
        try {
          console.log("Sending admin notification to:", subscriptionRecipients);
          await sendAdminNotificationEmail(resend, orderData, subscriptionRecipients);
          console.log("Admin notification sent successfully");
        } catch (emailError) {
          console.error("Failed to send admin notification:", emailError);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

// Order data type
interface OrderData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  birthPlace: string;
  fiscalCode: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  clubId: string;
  clubName: string;
  contractId: string;
  contractName: string;
  type: string;
  amountTotal: number;
  currency: string;
  paymentId: string;
  createdAt: string;
  // Additional fields
  passwordHash?: string; // Hashed password (bcrypt)
  stripeCustomerId?: string;
  // Invoice data (populated after invoice creation)
  invoiceId?: number;
  invoiceNumber?: string;
  invoicePdfUrl?: string;
  // Client creation result
  clientId?: number;
}

// Format currency
function formatCurrency(amount: number, currency: string = "eur"): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

// Format date for display (full with time)
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format date short (dd/mm/yyyy)
function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Welcome email function
async function sendWelcomeEmail(resend: Resend, order: OrderData) {
  const { email, firstName, clubName, contractName, amountTotal, currency, paymentId, createdAt, invoiceNumber, invoicePdfUrl } = order;

  // Invoice section HTML (only if invoice was created)
  const invoiceSection = invoiceNumber ? `
              <!-- Invoice -->
              <div style="background-color: #e0f2fe; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #0284c7;">
                <table style="width: 100%;">
                  <tr>
                    <td>
                      <p style="margin: 0; color: #0369a1; font-size: 14px; font-weight: 600;">
                        🧾 Fattura n. ${invoiceNumber}
                      </p>
                      <p style="margin: 4px 0 0; color: #0c4a6e; font-size: 12px;">
                        La tua fattura elettronica è stata generata e inviata all'Agenzia delle Entrate.
                      </p>
                    </td>
                    ${invoicePdfUrl ? `
                    <td style="text-align: right;">
                      <a href="${invoicePdfUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 600;">
                        Scarica PDF
                      </a>
                    </td>
                    ` : ''}
                  </tr>
                </table>
              </div>
  ` : '';

  await resend.emails.send({
    from: "24FIT <noreply@24fit.it>",
    to: email,
    subject: "Benvenuto in 24FIT! 🎉",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benvenuto in 24FIT</title>
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
                Ciao ${firstName}! 👋
              </h2>

              <p style="margin: 0 0 24px; color: #666666; font-size: 16px; line-height: 1.6;">
                Grazie per aver scelto <strong style="color: #1a1a1a;">24FIT</strong>! Il tuo abbonamento è stato attivato con successo.
              </p>

              <!-- Subscription Details -->
              <div style="background-color: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 16px; font-weight: 700; text-transform: uppercase;">
                  Riepilogo abbonamento
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Club:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right;">${clubName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Piano:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right;">${contractName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Importo pagato:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right;">${formatCurrency(amountTotal, currency)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Data acquisto:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right;">${formatDate(createdAt)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">ID Transazione:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 12px; font-weight: 500; text-align: right; font-family: monospace;">${paymentId.slice(0, 20)}...</td>
                  </tr>
                </table>
              </div>

              ${invoiceSection}

              <!-- Next Steps -->
              <div style="background-color: #FFCF02; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 16px; font-weight: 700;">
                  🚀 Prossimi passi
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #1a1a1a; font-size: 14px; line-height: 1.8;">
                  <li><strong>Scarica l'app 24FIT</strong> dal tuo store</li>
                  <li><strong>Accedi</strong> con: <code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px;">${email}</code></li>
                  <li><strong>Inizia ad allenarti</strong> quando vuoi, 24/7!</li>
                </ol>
              </div>

              <!-- Download Buttons -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px;">
                    <a href="#" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                      📱 Scarica l'app
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; color: #999999; font-size: 14px; line-height: 1.6; text-align: center;">
                Hai domande? Rispondi a questa email o contattaci su WhatsApp.
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
}

// Admin notification email function
async function sendAdminNotificationEmail(resend: Resend, order: OrderData, recipients: string[]) {
  const {
    email,
    firstName,
    lastName,
    phone,
    birthDate,
    birthPlace,
    fiscalCode,
    address,
    city,
    postalCode,
    province,
    clubName,
    contractName,
    amountTotal,
    currency,
    paymentId,
    createdAt,
  } = order;

  const fullAddress = `${address}, ${postalCode} ${city} (${province})`;

  await resend.emails.send({
    from: "24FIT <noreply@24fit.it>",
    to: recipients,
    subject: `Nuovo abbonamento: ${firstName} ${lastName} - ${formatCurrency(amountTotal, currency)}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuovo Ordine 24FIT</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #FFCF02; padding: 24px; text-align: center;">
              <div style="display: inline-block; width: 40px; height: 40px; background-color: #ffffff; border-radius: 50%; line-height: 40px; text-align: center; margin-bottom: 8px;">
                <span style="font-size: 20px;">$</span>
              </div>
              <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 24px; font-weight: 800;">
                Nuovo Abbonamento!
              </h1>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding: 24px; background-color: #fffdf5;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 16px;">
                    <span style="color: #666666; font-size: 14px;">Importo:</span>
                    <span style="color: #FFCF02; font-size: 28px; font-weight: 800; display: block;">${formatCurrency(amountTotal, currency)}</span>
                  </td>
                  <td style="padding: 8px 16px; text-align: right;">
                    <span style="color: #FFCF02; font-size: 14px; font-weight: 600;">Data:</span>
                    <span style="color: #1a1a1a; font-size: 14px; font-weight: 600; display: block;">${formatDate(createdAt)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Details -->
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 18px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                👤 Dati Cliente
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px; width: 140px;">Nome:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Email:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Telefono:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Data nascita:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${formatDateShort(birthDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Luogo nascita:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${birthPlace || "Non fornito"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Codice Fiscale:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-family: monospace;">${fiscalCode || "Non fornito"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Indirizzo:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${fullAddress}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 18px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                📋 Dettagli Ordine
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px; width: 140px;">Club:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${clubName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Piano:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${contractName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">ID Pagamento:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 12px; font-family: monospace;">${paymentId}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px;">
                    <a href="https://dashboard.24fit.it" style="display: block; background-color: #FFCF02; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; text-align: center;">
                      Apri Dashboard →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 8px;">
                    <a href="https://dashboard.stripe.com/payments/${paymentId}" style="display: block; background-color: #635bff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; text-align: center;">
                      Vedi su Stripe →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #888888; font-size: 12px;">
                Email automatica generata da 24FIT | ${formatDate(createdAt)}
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
}

// Daily Pass confirmation email to customer
async function sendDailyPassConfirmationEmail(resend: Resend, order: OrderData) {
  const { email, firstName, clubName, amountTotal, currency, paymentId, createdAt, invoiceNumber, invoicePdfUrl } = order;

  // Invoice section HTML (only if invoice was created)
  const invoiceSection = invoiceNumber ? `
              <!-- Invoice -->
              <div style="background-color: #e0f2fe; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #0284c7;">
                <table style="width: 100%;">
                  <tr>
                    <td>
                      <p style="margin: 0; color: #0369a1; font-size: 14px; font-weight: 600;">
                        🧾 Fattura n. ${invoiceNumber}
                      </p>
                      <p style="margin: 4px 0 0; color: #0c4a6e; font-size: 12px;">
                        La tua fattura elettronica è stata generata.
                      </p>
                    </td>
                    ${invoicePdfUrl ? `
                    <td style="text-align: right;">
                      <a href="${invoicePdfUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 600;">
                        Scarica PDF
                      </a>
                    </td>
                    ` : ''}
                  </tr>
                </table>
              </div>
  ` : '';

  await resend.emails.send({
    from: "24FIT <noreply@24fit.it>",
    to: email,
    subject: "Daily Pass confermato! 🎉",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Pass 24FIT</title>
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
                Ciao ${firstName}! 👋
              </h2>

              <p style="margin: 0 0 24px; color: #666666; font-size: 16px; line-height: 1.6;">
                Il tuo <strong style="color: #1a1a1a;">Daily Pass</strong> è stato acquistato con successo!
              </p>

              <!-- Pass Details -->
              <div style="background-color: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 16px; font-weight: 700; text-transform: uppercase;">
                  Riepilogo acquisto
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Prodotto:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right;">Daily Pass</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Club:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right;">${clubName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Importo pagato:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right;">${formatCurrency(amountTotal, currency)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Data acquisto:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600; text-align: right;">${formatDate(createdAt)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">ID Transazione:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 12px; font-weight: 500; text-align: right; font-family: monospace;">${paymentId.slice(0, 20)}...</td>
                  </tr>
                </table>
              </div>

              ${invoiceSection}

              <!-- How to use -->
              <div style="background-color: #FFCF02; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 16px; font-weight: 700;">
                  🏋️ Come usare il tuo Daily Pass
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #1a1a1a; font-size: 14px; line-height: 1.8;">
                  <li>Presentati in <strong>reception</strong> negli orari indicati</li>
                  <li>Mostra questa email come conferma</li>
                  <li>Allenati liberamente per tutto il tempo!</li>
                </ol>
              </div>

              <!-- Hours info -->
              <div style="background-color: #f0f0f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0; color: #1a1a1a; font-size: 14px;">
                  <strong>Orari reception:</strong> Lun-Ven 10-13 e 16-20
                </p>
              </div>

              <!-- Promo -->
              <div style="background-color: #10b981; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0; color: #ffffff; font-size: 14px; text-align: center;">
                  <strong>Ti è piaciuto?</strong> Iscriviti entro 10 giorni e il Daily Pass viene scontato dall'abbonamento!
                </p>
              </div>

              <p style="margin: 32px 0 0; color: #999999; font-size: 14px; line-height: 1.6; text-align: center;">
                Hai domande? Rispondi a questa email o contattaci su WhatsApp.
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
}

// Daily Pass admin notification email
async function sendDailyPassAdminNotificationEmail(resend: Resend, order: OrderData, recipients: string[]) {
  const {
    email,
    firstName,
    lastName,
    phone,
    birthDate,
    birthPlace,
    fiscalCode,
    address,
    city,
    postalCode,
    province,
    clubName,
    amountTotal,
    currency,
    paymentId,
    createdAt,
  } = order;

  const fullAddress = `${address}, ${postalCode} ${city} (${province})`;

  await resend.emails.send({
    from: "24FIT <noreply@24fit.it>",
    to: recipients,
    subject: `🎫 Nuovo Daily Pass: ${firstName} ${lastName} - ${clubName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuovo Daily Pass</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #f59e0b; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">
                🎫 Nuovo Daily Pass
              </h1>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding: 24px; background-color: #fffbeb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 16px;">
                    <span style="color: #666666; font-size: 14px;">Importo:</span>
                    <span style="color: #f59e0b; font-size: 28px; font-weight: 800; display: block;">${formatCurrency(amountTotal, currency)}</span>
                  </td>
                  <td style="padding: 8px 16px; text-align: right;">
                    <span style="color: #666666; font-size: 14px;">Club:</span>
                    <span style="color: #1a1a1a; font-size: 16px; font-weight: 600; display: block;">${clubName}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Details -->
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 18px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                👤 Dati Cliente
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px; width: 140px;">Nome:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Email:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Telefono:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Data nascita:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${formatDateShort(birthDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Luogo nascita:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${birthPlace || "Non fornito"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Codice Fiscale:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-family: monospace;">${fiscalCode || "Non fornito"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Indirizzo:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${fullAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Data acquisto:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${formatDate(createdAt)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">ID Pagamento:</td>
                  <td style="padding: 8px 0; color: #1a1a1a; font-size: 12px; font-family: monospace;">${paymentId}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px;">
                    <a href="https://dashboard.24fit.it" style="display: block; background-color: #FFCF02; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; text-align: center;">
                      Apri Dashboard →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 8px;">
                    <a href="https://dashboard.stripe.com/payments/${paymentId}" style="display: block; background-color: #635bff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; text-align: center;">
                      Vedi su Stripe →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #888888; font-size: 12px;">
                Email automatica generata da 24FIT | ${formatDate(createdAt)}
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
}
