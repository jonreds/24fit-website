"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const COOKIE_CONSENT_KEY = "24fit-cookie-consent";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to avoid layout shift on page load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString(),
      })
    );
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
      })
    );
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="container max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Main Banner */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex w-12 h-12 rounded-xl bg-[var(--brand)]/10 items-center justify-center flex-shrink-0">
                    <Cookie size={24} className="text-[var(--brand)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">
                      Utilizziamo i cookie
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Utilizziamo cookie tecnici necessari al funzionamento del sito e,
                      con il tuo consenso, cookie di analytics per migliorare la tua esperienza.{" "}
                      <Link href="/privacy" className="text-[var(--brand)] hover:underline">
                        Leggi la Privacy Policy
                      </Link>
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={acceptAll}
                        className="btn btn-primary py-2.5 px-6 text-sm"
                      >
                        Accetta tutti
                      </button>
                      <button
                        onClick={acceptNecessary}
                        className="inline-flex items-center justify-center gap-2 font-bold rounded-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 px-6 text-sm transition-all"
                      >
                        Solo necessari
                      </button>
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-sm text-gray-500 hover:text-[var(--brand)] transition-colors underline underline-offset-2"
                      >
                        {showDetails ? "Nascondi dettagli" : "Personalizza"}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={acceptNecessary}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Chiudi"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Details Panel */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-gray-100"
                  >
                    <div className="p-6 bg-gray-50 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">Cookie necessari</p>
                          <p className="text-xs text-gray-500">Essenziali per il funzionamento del sito</p>
                        </div>
                        <div className="w-10 h-6 bg-[var(--brand)] rounded-full flex items-center justify-end px-1">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">Cookie analytics</p>
                          <p className="text-xs text-gray-500">Ci aiutano a capire come usi il sito</p>
                        </div>
                        <p className="text-xs text-gray-400">Inclusi in "Accetta tutti"</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">Cookie marketing</p>
                          <p className="text-xs text-gray-500">Per mostrarti contenuti personalizzati</p>
                        </div>
                        <p className="text-xs text-gray-400">Inclusi in "Accetta tutti"</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
