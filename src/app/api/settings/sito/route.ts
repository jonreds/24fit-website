import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Force Node.js runtime (Edge Runtime doesn't support fs)
export const runtime = "nodejs";

// File path for settings storage
const SETTINGS_FILE = path.join(process.cwd(), "site-settings.json");

// Default settings
const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  maintenanceMessage: "Il sito è in manutenzione. Tornerà disponibile entro 24h.",
  appStoreLink: "",
  playStoreLink: "",
  appComingSoon: true, // true = app non ancora disponibile, mostra messaggio "in arrivo"
  appComingSoonMessage: "L'app 24FIT sarà disponibile a breve! Ti avviseremo via email quando potrai scaricarla.",
  dailyPassEnabled: true,
  featuredPlanId: null,
  // Scrolling banner settings
  bannerEnabled: false,
  bannerBgColor: "#FDCF07",
  bannerTextColor: "#FFFFFF",
  bannerItems: [
    { text: "Accesso 24/7", icon: "clock" },
    { text: "2 Palestre", icon: "mapPin" },
    { text: "500+ Membri", icon: "users" },
    { text: "App Gratuita", icon: "smartphone" },
  ],
  // Popup settings
  popupEnabled: false,
  popupTitle: "Offerta Speciale",
  popupSubtitle: "Fino al 10 gennaio",
  popupText: "-50€ sull'annuale",
  popupDescription: "Abbonati per 12 mesi e risparmia. L'offerta scade presto!",
  popupButtonText: "Iscriviti oggi",
  popupButtonLink: "/abbonamenti",
};

// CORS headers for dashboard access
const getAllowedOrigin = (origin: string | null) => {
  const allowedOrigins = [
    "https://dashboard.24fit.it",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:5174",
  ];
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  return "https://dashboard.24fit.it";
};

const getCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(origin),
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
});

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

// Maintenance flag file (for Nginx to check)
const MAINTENANCE_FLAG = path.join(process.cwd(), ".maintenance");

// Helper to write settings
async function saveSettings(settings: typeof DEFAULT_SETTINGS) {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));

  // Create or remove maintenance flag file for Nginx
  if (settings.maintenanceMode) {
    await fs.writeFile(MAINTENANCE_FLAG, "1");
  } else {
    try {
      await fs.unlink(MAINTENANCE_FLAG);
    } catch {
      // File doesn't exist, ignore
    }
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

// GET - Retrieve settings (public, no auth needed for reading)
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  try {
    const settings = await getSettings();
    return NextResponse.json(
      { success: true, data: settings },
      { headers: getCorsHeaders(origin) }
    );
  } catch (error) {
    console.error("Error reading settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to read settings" },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}

// PUT - Update settings (requires auth)
export async function PUT(request: NextRequest) {
  const origin = request.headers.get("origin");
  console.log("[Settings API] PUT request from origin:", origin);

  try {
    // Check for authorization header
    const authHeader = request.headers.get("authorization");
    console.log("[Settings API] Auth header present:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[Settings API] Unauthorized - no valid Bearer token");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: getCorsHeaders(origin) }
      );
    }

    const body = await request.json();
    console.log("[Settings API] Body received:", JSON.stringify(body).slice(0, 200));

    const currentSettings = await getSettings();

    // Merge with existing settings
    const newSettings = {
      ...currentSettings,
      ...body,
    };

    await saveSettings(newSettings);
    console.log("[Settings API] Settings saved successfully");

    return NextResponse.json(
      { success: true, data: newSettings },
      { headers: getCorsHeaders(origin) }
    );
  } catch (error) {
    console.error("[Settings API] Error saving settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}
