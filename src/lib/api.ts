// ═══════════════════════════════════════════════════════════════
// 24FIT API UTILITIES
// ═══════════════════════════════════════════════════════════════

// Use local API proxy to avoid CORS issues
// Server-side: use API_URL or NEXT_PUBLIC_API_URL, Client-side: use relative path
const API_BASE_URL = typeof window !== 'undefined' ? '' : (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001');

// Mapping servizi ID to display labels for the website
const SERVIZI_LABELS: Record<string, string> = {
  'accesso_24_7': 'Accesso 24/7',
  'sala_pesi': 'Sala Pesi',
  'cardio': 'Area Cardio',
  'piscina': 'Piscina',
  'sauna': 'Sauna',
  'spogliatoi': 'Docce gratuite',
  'armadietto': 'Armadietto personale',
  'pt_incluso': 'Personal Trainer incluso',
  'app': 'App Mobile',
  'corsi': 'Corsi di gruppo',
  'parcheggio': 'Parcheggio gratuito',
  'wifi': 'Wi-Fi gratuito',
  'multi_sede': 'Un abbonamento più sedi',
  'asciugamani': 'Asciugamani inclusi',
  'niente_code': 'Niente code',
};

export interface APIPiano {
  id: string;
  nome: string;
  descrizione?: string;
  prezzo: number;
  prezzo_scontato?: number;
  durata_giorni: number;
  quota_iscrizione?: number;
  badge?: string;
  evidenziato: boolean;
  testo_cta?: string;
  note_prezzo?: string;
  promo_attiva: boolean;
  testo_promo?: string;
  prezzo_totale: number;
  servizi_inclusi: string[];
  ordine: number;
}

export interface Plan {
  id: string;
  name: string;
  duration: number; // mesi
  price: number;
  pricePerMonth: number;
  activationFee: number;
  popular?: boolean;
  badge?: string;
  features: string[];
  promoActive?: boolean;
  promoText?: string;
  promoPrice?: number; // Prezzo promozionale (quando promo è attiva)
  ctaText?: string;
  priceNote?: string;
}

// Fetch piani pubblici dall'API (usa proxy locale per evitare CORS)
// If strutturaId is provided, structure-specific promotions will be applied
export async function fetchPublicPlans(strutturaId?: string): Promise<Plan[]> {
  try {
    // Client-side: use local API proxy; Server-side: call API directly
    let url = typeof window !== 'undefined'
      ? '/api/piani'
      : `${API_BASE_URL}/api/public/piani`;

    // Add strutturaId if provided
    if (strutturaId) {
      url += `?strutturaId=${encodeURIComponent(strutturaId)}`;
    }

    const response = await fetch(url, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response');
    }

    // Map API response to Plan interface
    const mapped = data.data.map((piano: any) => {
      // Check if data is already in the new format (from /api/public/piani)
      if (piano.name && piano.price !== undefined && piano.activationFee !== undefined) {
        // Data is already mapped, use directly
        return {
          id: piano.id,
          name: piano.name,
          duration: piano.duration,
          price: piano.price,
          pricePerMonth: piano.pricePerMonth,
          activationFee: piano.activationFee,
          popular: piano.popular || piano.featured,
          badge: piano.badge,
          features: piano.features || [
            "Accesso 24/7",
            "Un abbonamento più sedi",
            "Niente code",
            "Docce gratuite",
          ],
          promoActive: piano.promoActive,
          promoText: piano.promoText,
          promoPrice: piano.promoActive && piano.promoPrice
            ? piano.promoPrice + piano.activationFee
            : null,
          ctaText: piano.ctaText,
          priceNote: piano.priceNote,
        };
      }

      // Legacy format: map from raw API response
      const durationMonths = piano.durata_mesi || Math.round(piano.durata_giorni / 30);
      const prezzoAbbonamento = parseFloat(piano.prezzo) || 0;
      const quotaIscrizione = parseFloat(piano.quota_iscrizione) || 0;
      const prezzoPromo = piano.prezzo_promo != null ? parseFloat(piano.prezzo_promo) : null;
      const pricePerMonth = piano.prezzo_per_mese
        ? parseFloat(piano.prezzo_per_mese)
        : Math.round(prezzoAbbonamento / durationMonths);

      // Prezzo originale (sempre prezzo + quota, senza promo)
      const prezzoOriginale = prezzoAbbonamento + quotaIscrizione;
      // Prezzo promo totale (se promo attiva)
      const prezzoPromoTotale = piano.promo_attiva && prezzoPromo != null
        ? prezzoPromo + quotaIscrizione
        : null;

      return {
        id: piano.id,
        name: piano.nome || `${durationMonths} ${durationMonths === 1 ? 'mese' : 'Mesi'}`,
        duration: durationMonths,
        // price è sempre il prezzo ORIGINALE (senza promo) - serve per mostrarlo barrato
        price: prezzoOriginale,
        pricePerMonth: pricePerMonth,
        activationFee: quotaIscrizione,
        popular: piano.evidenziato,
        badge: piano.badge === 'popolare' ? 'Più scelto' :
               piano.badge === 'best_value' ? 'più conveniente' :
               piano.badge === 'nuovo' ? 'Nuovo' :
               piano.badge === 'promo' ? 'Promo' :
               piano.badge || undefined,
        // Map servizi_inclusi to readable labels + custom perks
        features: (() => {
          // Standard services from servizi_inclusi
          const standardFeatures = piano.servizi_inclusi && piano.servizi_inclusi.length > 0
            ? piano.servizi_inclusi
                .map((id: string) => SERVIZI_LABELS[id])
                .filter((label: string | undefined): label is string => !!label)
            : [
                "Accesso 24/7",
                "Un abbonamento più sedi",
                "Niente code",
                "Docce gratuite",
              ];

          // Custom perks from perks_custom (each has icon and label)
          const customFeatures = (piano.perks_custom || [])
            .map((perk: { icon: string; label: string }) => `${perk.icon} ${perk.label}`);

          return [...standardFeatures, ...customFeatures];
        })(),
        promoActive: piano.promo_attiva,
        promoText: piano.testo_promo,
        // promoPrice è il prezzo promozionale totale (prezzo_promo + quota)
        promoPrice: prezzoPromoTotale,
        ctaText: piano.testo_cta,
        priceNote: piano.note_prezzo,
      };
    });

    return mapped.sort((a: Plan, b: Plan) => a.duration - b.duration);
  } catch (error) {
    console.error('Error fetching plans from API:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// CLUBS / STRUTTURE API
// ═══════════════════════════════════════════════════════════════

import { Club, CLUBS as FALLBACK_CLUBS } from "@/data/constants";

// API response type for strutture
interface StrutturaAPI {
  id: string;
  nome: string;
  codice: string;
  indirizzo: string | null;
  citta: string;
  cap: string | null;
  provincia: string | null;
  nazione: string | null;
  telefono: string | null;
  email: string | null;
  attiva: boolean;
  sempreAperto: boolean;
  orariAccesso: unknown | null;
  receptionSempreDisponibile: boolean;
  orariReception: unknown | null;
  capacitaMassima: number | null;
  tornelliAbilitati: boolean;
  latitudine: number | null;
  longitudine: number | null;
  immagineUrl: string | null;
  ordine: number;
  mostraSuSito: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper per formattare gli orari reception dal JSON
interface OrarioReceptionGiorno {
  giorno: string;
  attivo: boolean;
  fasce: { inizio: string; fine: string }[];
}

function formatReceptionHours(orariReception: OrarioReceptionGiorno[] | null): string {
  if (!orariReception || !Array.isArray(orariReception)) {
    return "10:00 - 13:00 / 16:00 - 20:00"; // Default fallback
  }

  // Trova i giorni attivi
  const giorniAttivi = orariReception.filter(g => g.attivo && g.fasce && g.fasce.length > 0);

  if (giorniAttivi.length === 0) {
    return "Su appuntamento";
  }

  // Prendi le fasce del primo giorno attivo come riferimento
  const fasceRif = giorniAttivi[0].fasce;
  const fasceStr = fasceRif.map(f => `${f.inizio} - ${f.fine}`).join(" / ");

  // Mappa giorni abbreviati
  const mapGiorni: Record<string, string> = {
    lunedi: "Lun", martedi: "Mar", mercoledi: "Mer", giovedi: "Gio",
    venerdi: "Ven", sabato: "Sab", domenica: "Dom"
  };

  const ordineGiorni = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
  const giorniAttOrd = giorniAttivi
    .map(g => g.giorno)
    .sort((a, b) => ordineGiorni.indexOf(a) - ordineGiorni.indexOf(b));

  // Se tutti i giorni della settimana
  if (giorniAttOrd.length === 7) {
    return fasceStr;
  }

  // Se Lun-Ven
  if (giorniAttOrd.length === 5 &&
      giorniAttOrd.includes("lunedi") && giorniAttOrd.includes("venerdi") &&
      !giorniAttOrd.includes("sabato") && !giorniAttOrd.includes("domenica")) {
    return `Lun-Ven: ${fasceStr}`;
  }

  // Altrimenti elenca i giorni
  const giorniAbbr = giorniAttOrd.map(g => mapGiorni[g] || g).join(", ");
  return `${giorniAbbr}: ${fasceStr}`;
}

// Convert API struttura to Club format
function convertStrutturaToClub(struttura: StrutturaAPI): Club {
  const slug = struttura.id || struttura.nome
    .toLowerCase()
    .replace(/24fit\s*/i, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return {
    id: struttura.id,
    slug,
    name: struttura.nome,
    city: struttura.citta,
    province: struttura.provincia || "",
    address: struttura.indirizzo || "",
    fullAddress: `${struttura.indirizzo || ""}, ${struttura.citta}${struttura.provincia ? ` (${struttura.provincia})` : ""}`,
    phone: struttura.telefono || "",
    landline: "0376 134 004",
    email: struttura.email || `${slug}@24fit.it`,
    receptionHours: struttura.receptionSempreDisponibile
      ? "24/7"
      : formatReceptionHours(struttura.orariReception as OrarioReceptionGiorno[] | null),
    accessHours: struttura.sempreAperto ? "24/7" : "06:00 - 23:00",
    coordinates: {
      lat: struttura.latitudine ? Number(struttura.latitudine) : 0,
      lng: struttura.longitudine ? Number(struttura.longitudine) : 0,
    },
    features: [
      "Cardio",
      "Pesi liberi",
      "Functional training",
      "Spogliatoi",
      "Docce",
      "Armadietti",
    ],
    images: [
      `/images/clubs/${slug}-1.jpg`,
      `/images/clubs/${slug}-2.jpg`,
      `/images/clubs/${slug}-3.jpg`,
    ],
  };
}

/**
 * Fetch clubs from API
 * Uses ISR (Incremental Static Regeneration) for caching
 * Falls back to hardcoded CLUBS on error
 */
export async function fetchClubs(): Promise<Club[]> {
  try {
    const url = `${API_BASE_URL}/api/strutture?sito=true`;

    const response = await fetch(url, {
      next: {
        revalidate: 300, // Revalidate every 5 minutes
      },
    });

    if (!response.ok) {
      console.warn("[API] Failed to fetch clubs, using fallback:", response.status);
      return FALLBACK_CLUBS;
    }

    const data = await response.json();

    if (!data.success || !Array.isArray(data.data)) {
      console.warn("[API] Invalid response format, using fallback");
      return FALLBACK_CLUBS;
    }

    const clubs = data.data.map(convertStrutturaToClub);

    if (clubs.length === 0) {
      console.warn("[API] No clubs returned, using fallback");
      return FALLBACK_CLUBS;
    }

    return clubs;
  } catch (error) {
    console.error("[API] Error fetching clubs:", error);
    return FALLBACK_CLUBS;
  }
}

/**
 * Fetch a single club by slug
 */
export async function fetchClubBySlug(slug: string): Promise<Club | undefined> {
  const clubs = await fetchClubs();
  return clubs.find((club) => club.slug === slug);
}

/**
 * Get all club slugs for static generation
 */
export async function getClubSlugs(): Promise<string[]> {
  const clubs = await fetchClubs();
  return clubs.map((club) => club.slug);
}

// ═══════════════════════════════════════════════════════════════
// SITE SETTINGS API
// ═══════════════════════════════════════════════════════════════

export interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  appStoreLink: string;
  playStoreLink: string;
  dailyPassEnabled: boolean;
  featuredPlanId: string | null;
  bannerEnabled: boolean;
  bannerBgColor: string;
  bannerTextColor: string;
  bannerItems: { text: string; icon: string }[];
  popupEnabled: boolean;
  popupTitle: string;
  popupSubtitle: string;
  popupText: string;
  popupDescription: string;
  popupButtonText: string;
  popupButtonLink: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  maintenanceMode: false,
  maintenanceMessage: "Il sito è in manutenzione.",
  appStoreLink: "",
  playStoreLink: "",
  dailyPassEnabled: true,
  featuredPlanId: null,
  bannerEnabled: false,
  bannerBgColor: "#FDCF07",
  bannerTextColor: "#FFFFFF",
  bannerItems: [],
  popupEnabled: false,
  popupTitle: "",
  popupSubtitle: "",
  popupText: "",
  popupDescription: "",
  popupButtonText: "",
  popupButtonLink: "",
};

/**
 * Fetch site settings from API
 * Returns app links and other site configuration
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const url = `${API_BASE_URL}/api/settings/sito`;

    const response = await fetch(url, {
      next: {
        revalidate: 60, // Revalidate every minute
      },
    });

    if (!response.ok) {
      console.warn("[API] Failed to fetch site settings, using defaults");
      return DEFAULT_SETTINGS;
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      return DEFAULT_SETTINGS;
    }

    return { ...DEFAULT_SETTINGS, ...data.data };
  } catch (error) {
    console.error("[API] Error fetching site settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Check if app links are available (not empty and not "#")
 */
export function hasAppLinks(settings: SiteSettings): boolean {
  const hasAppStore = !!(settings.appStoreLink && settings.appStoreLink !== "#" && settings.appStoreLink.trim() !== "");
  const hasPlayStore = !!(settings.playStoreLink && settings.playStoreLink !== "#" && settings.playStoreLink.trim() !== "");
  return hasAppStore || hasPlayStore;
}
