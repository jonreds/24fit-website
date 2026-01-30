// ═══════════════════════════════════════════════════════════════
// 24FIT DATA CONSTANTS
// ═══════════════════════════════════════════════════════════════

export interface Club {
  id: string;
  slug: string;
  name: string;
  city: string;
  province: string;
  address: string;
  fullAddress: string;
  phone: string;
  landline: string;
  email: string;
  receptionHours: string;
  accessHours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  features: string[];
  images: string[];
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
  // Promo fields (from API)
  promoActive?: boolean;
  promoText?: string;
  promoPrice?: number;
}

// ═══════════════════════════════════════════════════════════════
// CLUBS
// ═══════════════════════════════════════════════════════════════

export const CLUBS: Club[] = [
  {
    id: "villafranca",
    slug: "villafranca",
    name: "24FIT Villafranca",
    city: "Villafranca di Verona",
    province: "VR",
    address: "Viale Postumia 41",
    fullAddress: "Viale Postumia 41, Villafranca di Verona (VR)",
    phone: "379 144 1618",
    landline: "0376 134 004",
    email: "villafranca@24fit.it",
    receptionHours: "10:00 - 13:00 / 16:00 - 20:00",
    accessHours: "24/7",
    coordinates: {
      lat: 45.3531,
      lng: 10.8456,
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
      "/images/clubs/villafranca-1.jpg",
      "/images/clubs/villafranca-2.jpg",
      "/images/clubs/villafranca-3.jpg",
    ],
  },
  {
    id: "castiglione",
    slug: "castiglione",
    name: "24FIT Castiglione",
    city: "Castiglione delle Stiviere",
    province: "MN",
    address: "Via Silvio Longhi 38",
    fullAddress: "Via Silvio Longhi 38, Castiglione delle Stiviere (MN)",
    phone: "379 304 9148",
    landline: "0376 134 004",
    email: "castiglione@24fit.it",
    receptionHours: "10:00 - 13:00 / 16:00 - 20:00",
    accessHours: "24/7",
    coordinates: {
      lat: 45.3906,
      lng: 10.4878,
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
      "/images/clubs/castiglione-1.jpg",
      "/images/clubs/castiglione-2.jpg",
      "/images/clubs/castiglione-3.jpg",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// SUBSCRIPTION PLANS
// ═══════════════════════════════════════════════════════════════

// NOTA: Questi dati sono usati come fallback. I prezzi reali vengono
// caricati dinamicamente dall'API (api.24fit.it/api/public/piani)
export const PLANS: Plan[] = [
  {
    id: "3-mesi",
    name: "3 Mesi",
    duration: 3,
    price: 150, // Totale (abbonamento 120€ + iscrizione 30€)
    pricePerMonth: 40,
    activationFee: 30,
    features: [
      "Accesso 24/7",
      "Un abbonamento più sedi",
      "Niente code",
      "Docce gratuite",
    ],
  },
  {
    id: "6-mesi",
    name: "6 Mesi",
    duration: 6,
    price: 230, // Totale (abbonamento 180€ + iscrizione 50€)
    pricePerMonth: 30,
    activationFee: 50,
    popular: true,
    features: [
      "Accesso 24/7",
      "Un abbonamento più sedi",
      "Niente code",
      "Docce gratuite",
    ],
  },
  {
    id: "12-mesi",
    name: "12 Mesi",
    duration: 12,
    price: 390, // Totale (abbonamento 300€ + iscrizione 90€)
    pricePerMonth: 25,
    activationFee: 90,
    badge: "più conveniente",
    features: [
      "Accesso 24/7",
      "Un abbonamento più sedi",
      "Niente code",
      "Docce gratuite",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// CONTRACTS (for checkout)
// ═══════════════════════════════════════════════════════════════

export interface Contract {
  id: string;
  name: string;
  price: number;
  priceAfterPromo?: number;
  duration: number; // mesi
  highlight?: boolean;
  features: string[];
  activationFee: number;
}

export const CONTRACTS: Contract[] = [
  {
    id: "promo-2025",
    name: "PROMO 2025",
    price: 19.90,
    duration: 12,
    highlight: true,
    activationFee: 39,
    features: [
      "Durata minima contrattuale 12 mesi",
      "I primi 3 mesi: 19,90€/mese",
      "A partire dal 4° mese: 29,90€/mese",
      "Quota attivazione Membercard 39€",
      "Possibilità di sospendere l'abbonamento ogni anno civile da 1 a 6 mesi",
      "Pagamento con addebito diretto SEPA su conto corrente",
      "Accesso 24/7 a tutti i club 24FIT",
      "Aperti 365 giorni all'anno",
      "Corsi di gruppo inclusi",
    ],
  },
  {
    id: "standard",
    name: "STANDARD",
    price: 29.90,
    duration: 12,
    activationFee: 39,
    features: [
      "Durata minima contrattuale 12 mesi",
      "29,90€/mese per tutta la durata",
      "Prezzo fisso garantito",
      "Quota attivazione Membercard 39€",
      "Possibilità di sospendere l'abbonamento ogni anno civile da 1 a 6 mesi",
      "Pagamento con addebito diretto SEPA su conto corrente",
      "Accesso 24/7 a tutti i club 24FIT",
      "Aperti 365 giorni all'anno",
      "Corsi di gruppo inclusi",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// DAILY PASS
// ═══════════════════════════════════════════════════════════════

export const DAILY_PASS = {
  price: 10,
  validityDays: 1,
  discountIfSubscribe: true,
  discountWithinDays: 10,
  features: [
    "Accesso libero (10-13 e 16-20)",
    "Tutte le attrezzature",
    "Spogliatoi e docce",
  ],
};

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════

export const NAV_LINKS = [
  { href: "/palestre", label: "Palestre" },
  { href: "/abbonamenti", label: "Abbonamenti" },
  { href: "/daily-pass", label: "Daily Pass" },
  { href: "/nutrizione", label: "Nutrizione" },
];

// ═══════════════════════════════════════════════════════════════
// STATS (for homepage)
// ═══════════════════════════════════════════════════════════════

export const STATS = [
  { value: "24/7", label: "Accesso" },
  { value: "2", label: "Club" },
  { value: "1000+", label: "Membri" },
];

// ═══════════════════════════════════════════════════════════════
// SOCIAL LINKS
// ═══════════════════════════════════════════════════════════════

export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/24fit.it",
  instagram: "https://instagram.com/24fit.it",
  tiktok: "https://tiktok.com/@24fit.it",
};

// ═══════════════════════════════════════════════════════════════
// APP LINKS
// ═══════════════════════════════════════════════════════════════

export const APP_LINKS = {
  appStore: "#", // Aggiorna con link reale App Store
  playStore: "#", // Aggiorna con link reale Play Store
};

// ═══════════════════════════════════════════════════════════════
// CONTACT INFO
// ═══════════════════════════════════════════════════════════════

export const CONTACT = {
  email: "info@24fit.it",
  pec: "24fit@pec.it",
  vatNumber: "02700470202",
};
