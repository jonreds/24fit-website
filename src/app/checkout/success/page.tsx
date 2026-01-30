"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Download, Mail, Clock, Smartphone } from "lucide-react";
import { APP_LINKS } from "@/data/constants";

interface SiteSettings {
  appComingSoon?: boolean;
  appComingSoonMessage?: string;
  appStoreLink?: string;
  playStoreLink?: string;
}

export default function CheckoutSuccessPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    appComingSoon: true, // Default to true until we fetch settings
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings/sito");
        const data = await res.json();
        if (data.success && data.data) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Determine if app is available
  const appStoreLink = settings.appStoreLink || APP_LINKS.appStore;
  const playStoreLink = settings.playStoreLink || APP_LINKS.playStore;
  const hasValidAppLink =
    (appStoreLink && appStoreLink !== "#" && appStoreLink !== "") ||
    (playStoreLink && playStoreLink !== "#" && playStoreLink !== "");

  const isAppAvailable = !settings.appComingSoon && hasValidAppLink;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>

        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 text-center">
          Pagamento completato!
        </h1>

        <p className="text-gray-600 mb-8 text-center">
          Grazie per esserti iscritto a <span className="font-bold text-[var(--brand)]">24FIT</span>!
          <br />
          Riceverai a breve un'email con tutti i dettagli del tuo abbonamento.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4 text-center">Prossimi passi:</h3>
          <ul className="text-left space-y-3">
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[var(--brand)] flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">
                Controlla la tua email per la conferma dell'iscrizione
              </span>
            </li>

            {isAppAvailable ? (
              // App disponibile - mostra istruzioni download
              <li className="flex items-start gap-3">
                <Download className="w-5 h-5 text-[var(--brand)] flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 text-sm">
                  Scarica l'app 24FIT dal tuo store e accedi con le tue credenziali
                </span>
              </li>
            ) : (
              // App in arrivo - mostra messaggio coming soon
              <li className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-[var(--brand)] flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 text-sm">
                  {settings.appComingSoonMessage || "L'app 24FIT sarà disponibile a breve! Ti avviseremo via email quando potrai scaricarla."}
                </span>
              </li>
            )}

            <li className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[var(--brand)] flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">
                Presenta il tuo QR code in reception per completare l'attivazione
              </span>
            </li>
          </ul>
        </div>

        {/* App Coming Soon Banner */}
        {!isAppAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--brand)]/10 border border-[var(--brand)]/20 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-center gap-2 text-[var(--brand)]">
              <Smartphone className="w-5 h-5" />
              <span className="font-bold text-sm">App in arrivo!</span>
            </div>
            <p className="text-gray-600 text-xs mt-2">
              Stiamo ultimando l'app 24FIT. Riceverai una notifica via email appena sarà disponibile.
            </p>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className={`py-3 px-6 rounded-lg border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors ${
              isAppAvailable ? "flex-1" : "w-full"
            }`}
          >
            Torna alla home
          </Link>

          {isAppAvailable && (
            <a
              href={playStoreLink !== "#" && playStoreLink !== "" ? playStoreLink : appStoreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-6 rounded-lg bg-[var(--brand)] text-white font-bold hover:bg-[var(--brand)]/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Scarica l'app
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
}
