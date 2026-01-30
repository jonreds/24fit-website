"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const appFeatures = [
  "Accedi ai club con QR code",
  "Prenota Accesso o PT",
  "Monitora i tuoi progressi",
  "Gestisci il tuo abbonamento",
];

export function AppCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [appComingSoon, setAppComingSoon] = useState(true); // Default to true (hidden)
  const [appLinks, setAppLinks] = useState({ appStore: "", playStore: "" });
  const [loading, setLoading] = useState(true);

  // Fetch app settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings/sito");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAppComingSoon(data.data.appComingSoon !== false);
            setAppLinks({
              appStore: data.data.appStoreLink || "",
              playStore: data.data.playStoreLink || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Non mostrare la sezione se app coming soon o nessun link disponibile
  const hasAppStore = !appComingSoon && appLinks.appStore && appLinks.appStore !== "#";
  const hasPlayStore = !appComingSoon && appLinks.playStore && appLinks.playStore !== "#";

  // Don't render while loading or if no valid links
  if (loading || appComingSoon || (!hasAppStore && !hasPlayStore)) {
    return null;
  }

  return (
    <section className="bg-gray-50 overflow-hidden" ref={ref}>
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block bg-[var(--brand)] text-white font-bold text-sm uppercase tracking-wider px-4 py-2 rounded-full"
            >
              App 24FIT
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-3 mb-6"
            >
              Tutto il tuo allenamento{" "}
              <span className="text-[var(--brand)]">in tasca</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-600 text-lg mb-8 leading-relaxed"
            >
              Con l'app 24FIT hai il controllo completo del tuo abbonamento.
              <br />
              Accedi ai club, prenota le sessioni e tieni traccia dei tuoi progressi,
              tutto dal tuo smartphone.
            </motion.p>

            {/* Features list */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-3 mb-10"
            >
              {appFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--brand)]/10 flex items-center justify-center">
                    <Check size={14} className="text-[var(--brand)]" />
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </li>
              ))}
            </motion.ul>

            {/* App badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              {hasAppStore && (
                <Link
                  href={appLinks.appStore}
                  className="transition-transform hover:scale-105"
                >
                  <img
                    src="/images/app-store-badge.svg"
                    alt="Scarica su App Store"
                    className="h-14"
                  />
                </Link>
              )}
              {hasPlayStore && (
                <Link
                  href={appLinks.playStore}
                  className="transition-transform hover:scale-105"
                >
                  <img
                    src="/images/google-play-badge.svg"
                    alt="Scarica su Google Play"
                    className="h-14"
                  />
                </Link>
              )}
            </motion.div>
          </div>

          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative max-w-sm mx-auto">
              {/* Phone frame placeholder */}
              <div className="relative aspect-[9/19] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-gray-900 rounded-b-2xl" />
                <div className="w-full h-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] rounded-[2.5rem] flex items-center justify-center">
                  <div className="text-center text-black">
                    <span className="text-4xl font-black">24FIT</span>
                    <p className="text-sm font-medium mt-2 opacity-70">App Preview</p>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-[var(--brand)]/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[var(--brand)]/30 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
