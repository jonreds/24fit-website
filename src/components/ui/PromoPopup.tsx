"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
import Link from "next/link";

interface PopupSettings {
  popupEnabled: boolean;
  popupTitle: string;
  popupSubtitle: string;
  popupText: string;
  popupDescription: string;
  popupButtonText: string;
  popupButtonLink: string;
}

export function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<PopupSettings | null>(null);

  useEffect(() => {
    // Fetch settings from API
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings/sito");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSettings(data.data);

            // Check if popup is enabled and wasn't already closed in this session
            if (data.data.popupEnabled) {
              const closed = sessionStorage.getItem("promo-popup-closed");
              if (!closed) {
                // Show popup after 3 seconds
                setTimeout(() => setIsVisible(true), 3000);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching popup settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("promo-popup-closed", "true");
  };

  // Don't render if settings not loaded or popup disabled
  if (!settings || !settings.popupEnabled) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 backdrop-blur-md z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-xl"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-[var(--brand)] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Gift size={20} />
                  {settings.popupTitle}
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                {settings.popupSubtitle && (
                  <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">
                    {settings.popupSubtitle}
                  </p>
                )}
                <h3 className="text-3xl font-black mb-2">
                  {settings.popupText}
                </h3>
                {settings.popupDescription && (
                  <p className="text-gray-600 mb-6 whitespace-pre-line">
                    {settings.popupDescription}
                  </p>
                )}

                <Link
                  href={settings.popupButtonLink || "/abbonamenti"}
                  onClick={handleClose}
                  className="btn btn-primary w-full justify-center"
                >
                  {settings.popupButtonText}
                </Link>

                <button
                  onClick={handleClose}
                  className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  No grazie
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
