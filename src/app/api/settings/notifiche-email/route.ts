import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Force Node.js runtime (Edge Runtime doesn't support fs)
export const runtime = "nodejs";

// File path for notification email settings storage
const SETTINGS_FILE = path.join(process.cwd(), "notification-email-settings.json");

// Default settings (must match types.ts ConfigNotificheEmailAdmin)
const DEFAULT_SETTINGS = {
  nuoviAbbonamenti: {
    abilitato: true,
    destinatari: ["info@24fit.it", "luca@24fit.it"],
  },
  dailyPass: {
    abilitato: true,
    destinatari: ["info@24fit.it", "luca@24fit.it"],
  },
  scadenzeAbbonamento: {
    abilitato: false,
    destinatari: [],
  },
  scadenzeCertificato: {
    abilitato: false,
    destinatari: [],
  },
  documentiDaVerificare: {
    abilitato: false,
    destinatari: [],
  },
};

// CORS headers for dashboard access
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://dashboard.24fit.it",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Helper to read settings
async function getSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    // File doesn't exist, return defaults
    return DEFAULT_SETTINGS;
  }
}

// Helper to write settings
async function saveSettings(settings: typeof DEFAULT_SETTINGS) {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET - Retrieve settings (requires auth for sensitive email addresses)
export async function GET(request: NextRequest) {
  try {
    // Check for authorization header (optional for internal use)
    const authHeader = request.headers.get("authorization");
    const isInternal = request.headers.get("x-internal-request") === "true";

    // Allow internal requests (from webhook) without auth
    if (!isInternal && !authHeader) {
      // For external requests without auth, return minimal info
      const settings = await getSettings();
      return NextResponse.json(
        {
          success: true,
          data: {
            nuoviAbbonamenti: { abilitato: settings.nuoviAbbonamenti.abilitato },
            dailyPass: { abilitato: settings.dailyPass.abilitato },
            scadenzeAbbonamento: { abilitato: settings.scadenzeAbbonamento.abilitato },
            scadenzeCertificato: { abilitato: settings.scadenzeCertificato.abilitato },
            documentiDaVerificare: { abilitato: settings.documentiDaVerificare.abilitato },
          }
        },
        { headers: corsHeaders }
      );
    }

    const settings = await getSettings();
    return NextResponse.json(
      { success: true, data: settings },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error reading notification settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to read settings" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT - Update settings (requires auth)
export async function PUT(request: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const currentSettings = await getSettings();

    // Merge with existing settings
    const newSettings = {
      ...currentSettings,
      ...body,
    };

    await saveSettings(newSettings);

    return NextResponse.json(
      { success: true, data: newSettings },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error saving notification settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Export a helper function to get recipients (for use by webhook)
export async function getNotificationRecipients(type: keyof typeof DEFAULT_SETTINGS): Promise<string[]> {
  const settings = await getSettings();
  const config = settings[type];
  return config.abilitato ? config.destinatari : [];
}
