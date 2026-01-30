// ═══════════════════════════════════════════════════════════════
// FATTURE IN CLOUD API INTEGRATION
// Documentation: https://developers.fattureincloud.it/
// ═══════════════════════════════════════════════════════════════

const FIC_API_BASE = "https://api-v2.fattureincloud.it";

// Get environment variables at runtime (not at module load time)
function getFICAccessToken(): string {
  return process.env.FIC_ACCESS_TOKEN || "";
}

function getFICCompanyId(): string {
  return process.env.FIC_COMPANY_ID || "";
}

// Types for the API
export interface FICEntity {
  name: string;
  tax_code?: string; // Codice Fiscale (persona fisica)
  vat_number?: string; // Partita IVA (azienda)
  address_street?: string;
  address_postal_code?: string;
  address_city?: string;
  address_province?: string;
  country?: string;
  ei_code?: string; // Codice SDI (default 0000000 for privati)
}

export interface FICItem {
  name: string;
  description?: string;
  net_price: number;
  qty: number;
  vat: { id: number }; // VAT ID from Fatture in Cloud
}

export interface FICPayment {
  amount: number;
  due_date: string; // YYYY-MM-DD
  status: "paid" | "not_paid";
  paid_date?: string; // YYYY-MM-DD
}

export interface FICInvoiceRequest {
  type: "invoice";
  entity: FICEntity;
  date: string; // YYYY-MM-DD
  items_list: FICItem[];
  payments_list?: FICPayment[];
  e_invoice?: boolean;
  ei_data?: {
    payment_method?: string; // MP05 = bonifico, MP01 = contanti, MP08 = carta
  };
  currency?: { id: string };
  language?: { code: string; name: string };
  notes?: string;
}

export interface FICInvoiceResponse {
  data: {
    id: number;
    type: string;
    number: number;
    numeration: string;
    date: string;
    year: number;
    amount_net: number;
    amount_vat: number;
    amount_gross: number;
    url?: string; // PDF URL
    pdf_url?: string;
  };
}

export interface FICError {
  error: {
    message: string;
    code?: string;
  };
}

// Check if Fatture in Cloud is configured
export function isFICConfigured(): boolean {
  const token = getFICAccessToken();
  const companyId = getFICCompanyId();
  return !!token && !!companyId;
}

// Helper to make API requests
async function ficRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: object
): Promise<T> {
  const url = `${FIC_API_BASE}${endpoint}`;
  const token = getFICAccessToken();

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as FICError;
    throw new Error(
      `Fatture in Cloud API error: ${error.error?.message || response.statusText}`
    );
  }

  return data as T;
}

// Create an invoice
export async function createInvoice(
  invoice: FICInvoiceRequest
): Promise<FICInvoiceResponse> {
  if (!isFICConfigured()) {
    throw new Error("Fatture in Cloud not configured. Missing API credentials.");
  }

  const companyId = getFICCompanyId();
  return ficRequest<FICInvoiceResponse>(
    `/c/${companyId}/issued_documents`,
    "POST",
    { data: invoice }
  );
}

// Send invoice to SDI (Sistema di Interscambio)
export async function sendToSDI(invoiceId: number): Promise<void> {
  if (!isFICConfigured()) {
    throw new Error("Fatture in Cloud not configured. Missing API credentials.");
  }

  const companyId = getFICCompanyId();
  await ficRequest(
    `/c/${companyId}/issued_documents/${invoiceId}/e_invoice/send`,
    "POST"
  );
}

// Get invoice PDF URL
export async function getInvoicePDF(invoiceId: number): Promise<string> {
  if (!isFICConfigured()) {
    throw new Error("Fatture in Cloud not configured. Missing API credentials.");
  }

  const companyId = getFICCompanyId();
  const response = await ficRequest<{ data: { url: string } }>(
    `/c/${companyId}/issued_documents/${invoiceId}/attachment`,
    "GET"
  );

  return response.data.url;
}

// Verify e-invoice XML before sending
export async function verifyEInvoice(
  invoiceId: number
): Promise<{ valid: boolean; errors?: string[] }> {
  if (!isFICConfigured()) {
    throw new Error("Fatture in Cloud not configured. Missing API credentials.");
  }

  const companyId = getFICCompanyId();
  try {
    await ficRequest(
      `/c/${companyId}/issued_documents/${invoiceId}/e_invoice/verify`,
      "GET"
    );
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS FOR 24FIT
// ═══════════════════════════════════════════════════════════════

export interface CustomerData {
  firstName: string;
  lastName: string;
  fiscalCode?: string;
  vatNumber?: string;
  address: string;
  postalCode: string;
  city: string;
  province: string;
}

export interface OrderItem {
  name: string;
  description?: string;
  price: number; // Net price (without VAT)
  quantity: number;
}

// Create invoice for a 24FIT order
export async function create24FITInvoice(
  customer: CustomerData,
  items: OrderItem[],
  options: {
    paymentDate?: string;
    notes?: string;
    sendToSDI?: boolean;
  } = {}
): Promise<{
  invoiceId: number;
  invoiceNumber: string;
  pdfUrl?: string;
}> {
  const today = new Date().toISOString().split("T")[0];

  // Build entity (customer data)
  const entity: FICEntity = {
    name: `${customer.firstName} ${customer.lastName}`,
    tax_code: customer.fiscalCode?.toUpperCase(),
    vat_number: customer.vatNumber,
    address_street: customer.address,
    address_postal_code: customer.postalCode,
    address_city: customer.city,
    address_province: customer.province?.toUpperCase(),
    country: "Italia",
    ei_code: "0000000", // Default for privati (persone fisiche)
  };

  // Build items list
  // Note: VAT ID 0 is typically for exento/escluso (0%)
  // You may need to use the correct VAT ID from your Fatture in Cloud account
  // Common IDs: 0 = esente, 1 = 22%, 2 = 10%, 3 = 4%
  const ficItems: FICItem[] = items.map((item) => ({
    name: item.name,
    description: item.description,
    net_price: item.price,
    qty: item.quantity,
    vat: { id: 0 }, // Prestazioni sportive: esente IVA (art. 4 DPR 633/72)
  }));

  // Build payments list (if paid)
  const payments: FICPayment[] = options.paymentDate
    ? [
        {
          amount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          due_date: today,
          status: "paid",
          paid_date: options.paymentDate,
        },
      ]
    : [];

  // Build invoice request
  const invoiceRequest: FICInvoiceRequest = {
    type: "invoice",
    entity,
    date: today,
    items_list: ficItems,
    payments_list: payments.length > 0 ? payments : undefined,
    e_invoice: true, // Always create e-invoice
    ei_data: {
      payment_method: "MP08", // Carta di pagamento
    },
    currency: { id: "EUR" },
    language: { code: "it", name: "Italiano" },
    notes: options.notes,
  };

  // Create the invoice
  const result = await createInvoice(invoiceRequest);

  let pdfUrl: string | undefined;

  // Optionally send to SDI
  if (options.sendToSDI) {
    try {
      // Verify first
      const verification = await verifyEInvoice(result.data.id);
      if (verification.valid) {
        await sendToSDI(result.data.id);
      } else {
        console.error("E-invoice verification failed:", verification.errors);
      }
    } catch (error) {
      console.error("Failed to send invoice to SDI:", error);
    }
  }

  // Get PDF URL
  try {
    pdfUrl = await getInvoicePDF(result.data.id);
  } catch (error) {
    console.error("Failed to get invoice PDF:", error);
  }

  return {
    invoiceId: result.data.id,
    invoiceNumber: `${result.data.number}${result.data.numeration || ""}`,
    pdfUrl,
  };
}
