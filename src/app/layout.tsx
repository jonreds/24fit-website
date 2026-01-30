import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { StructuredData } from "@/components/seo/StructuredData";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "24FIT - Palestre 24 ore su 24",
    template: "%s | 24FIT",
  },
  description:
    "Allenati quando vuoi, 24 ore su 24, 7 giorni su 7. Scopri i nostri club a Villafranca di Verona e Castiglione delle Stiviere.",
  keywords: [
    "palestra",
    "fitness",
    "24 ore",
    "Villafranca",
    "Castiglione delle Stiviere",
    "Verona",
    "Mantova",
    "abbonamento palestra",
  ],
  authors: [{ name: "24FIT" }],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://24fit.it",
    siteName: "24FIT",
    title: "24FIT - Palestre 24 ore su 24",
    description:
      "Allenati quando vuoi, 24 ore su 24, 7 giorni su 7. Scopri i nostri club.",
  },
  twitter: {
    card: "summary_large_image",
    title: "24FIT - Palestre 24 ore su 24",
    description: "Allenati quando vuoi, 24 ore su 24, 7 giorni su 7.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <StructuredData />
      </head>
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <GoogleAnalytics />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
