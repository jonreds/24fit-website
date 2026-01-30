"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CLUBS, NAV_LINKS, SOCIAL_LINKS, CONTACT } from "@/data/constants";

// MapPin Filled Icon (with transparent center)
const MapPinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C7.04 0 3 4.04 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.96-4.04-9-9-9zm0 12.75c-2.07 0-3.75-1.68-3.75-3.75S9.93 5.25 12 5.25s3.75 1.68 3.75 3.75-1.68 3.75-3.75 3.75z"/>
  </svg>
);

// Phone Filled Icon
const PhoneIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
  </svg>
);

// Mail Filled Icon
const MailIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

// WhatsApp Filled Icon
const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.31a8.188 8.188 0 01-1.26-4.38c.01-4.54 3.7-8.25 8.25-8.25zM8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01z"/>
  </svg>
);

// Instagram Filled Icon
const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// Facebook Filled Icon
const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [appComingSoon, setAppComingSoon] = useState(true); // Default to true (hidden)
  const [appLinks, setAppLinks] = useState({ appStore: "", playStore: "" });

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
      }
    };
    fetchSettings();
  }, []);

  // Check if app is available (not coming soon and has valid links)
  const hasAppStore = !appComingSoon && appLinks.appStore && appLinks.appStore !== "#";
  const hasPlayStore = !appComingSoon && appLinks.playStore && appLinks.playStore !== "#";

  return (
    <footer className="bg-[var(--brand)] text-white pt-24 pb-12">
      {/* Main Footer */}
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/logo.svg"
                alt="24FIT"
                width={120}
                height={28}
                className="h-7 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-white mb-6 leading-relaxed font-bold">
              Allenati quando vuoi, 24 ore su 24, 7 giorni su 7.
              <br />
              La libertà di essere fit.
            </p>
            {/* App Badges - mostrati solo se app disponibile e link validi */}
            {(hasAppStore || hasPlayStore) && (
              <div className="flex gap-3">
                {hasAppStore && (
                  <Link
                    href={appLinks.appStore}
                    className="transition-transform hover:scale-105"
                  >
                    <img
                      src="/images/app-store-badge.svg"
                      alt="Scarica su App Store"
                      className="h-12"
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
                      className="h-12"
                    />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Clubs Column */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">I Nostri Club</h4>
            <ul className="space-y-4">
              {CLUBS.map((club) => (
                <li key={club.id}>
                  <Link
                    href={`/palestre/${club.slug}`}
                    className="group inline-flex items-start gap-3 text-white font-bold transition-all duration-300 hover:-translate-y-1 hover:underline underline-offset-4 decoration-2"
                  >
                    <MapPinIcon size={18} />
                    <div>
                      <span className="block font-bold text-white">
                        {club.name}
                      </span>
                      <span className="text-sm font-bold text-white">{club.city}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Link Utili</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block text-white font-bold transition-all duration-300 hover:-translate-y-1 hover:underline underline-offset-4 decoration-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Contatti</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+390376134004"
                  className="inline-flex items-center gap-3 text-white font-bold transition-all duration-300 hover:-translate-y-1 hover:underline underline-offset-4 decoration-2"
                >
                  <PhoneIcon size={18} />
                  <span>0376 134 004</span>
                </a>
              </li>
              {CLUBS.map((club) => (
                <li key={club.id}>
                  <a
                    href={`https://wa.me/39${club.phone.replace(/\s/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-white font-bold transition-all duration-300 hover:-translate-y-1 hover:underline underline-offset-4 decoration-2"
                  >
                    <WhatsAppIcon size={18} />
                    <span>
                      {club.phone}
                      <span className="text-sm text-white ml-2">
                        ({club.city.split(" ")[0]})
                      </span>
                    </span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex items-center gap-3 text-white font-bold transition-all duration-300 hover:-translate-y-1 hover:underline underline-offset-4 decoration-2"
                >
                  <MailIcon size={18} />
                  {CONTACT.email}
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <motion.a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-white text-[var(--brand)] flex items-center justify-center hover:bg-white/80 transition-colors"
              >
                <InstagramIcon size={20} />
              </motion.a>
              <motion.a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-white text-[var(--brand)] flex items-center justify-center hover:bg-white/80 transition-colors"
              >
                <FacebookIcon size={20} />
              </motion.a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/30 mt-16 pt-4">
        <div className="container pb-8">
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 text-sm text-white font-bold">
            {/* Left: Copyright, P.IVA, PEC */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>© {currentYear} 24FIT SRL</span>
              <span className="hidden md:inline">|</span>
              <span>P.IVA {CONTACT.vatNumber}</span>
              <span className="hidden md:inline">|</span>
              <span>PEC: {CONTACT.pec}</span>
            </div>
            {/* Right: Legal Links */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link href="/termini" className="hover:underline underline-offset-4 transition-all">
                Termini e Condizioni
              </Link>
              <span className="hidden md:inline">|</span>
              <Link href="/codice-etico" className="hover:underline underline-offset-4 transition-all">
                Codice Etico
              </Link>
              <span className="hidden md:inline">|</span>
              <Link href="/privacy" className="hover:underline underline-offset-4 transition-all">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
