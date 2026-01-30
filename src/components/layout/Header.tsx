"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, Download, Clock, MapPin, Users, Smartphone, Star, Zap, Heart, Gift, Trophy, Dumbbell, Flame, Sparkles, type LucideIcon } from "lucide-react";
import { NAV_LINKS } from "@/data/constants";

// Map icon names to components for banner
const bannerIconMap: Record<string, LucideIcon> = {
  clock: Clock, mapPin: MapPin, users: Users, smartphone: Smartphone,
  star: Star, zap: Zap, heart: Heart, gift: Gift, trophy: Trophy,
  dumbbell: Dumbbell, flame: Flame, sparkles: Sparkles,
};

interface BannerItem { text: string; icon: string; }
interface BannerSettings {
  enabled: boolean;
  bgColor: string;
  textColor: string;
  items: BannerItem[];
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDailyPassEnabled, setIsDailyPassEnabled] = useState(true);
  const [appComingSoon, setAppComingSoon] = useState(true); // Default to true (hidden)
  const [appLinks, setAppLinks] = useState({ appStore: "", playStore: "" });
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const pathname = usePathname();

  // Check settings (Daily Pass, Banner, and App Coming Soon)
  useEffect(() => {
    const checkSettings = async () => {
      try {
        const response = await fetch("/api/settings/sito");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setIsDailyPassEnabled(data.data.dailyPassEnabled !== false);
            // App Coming Soon setting
            setAppComingSoon(data.data.appComingSoon !== false);
            setAppLinks({
              appStore: data.data.appStoreLink || "",
              playStore: data.data.playStoreLink || "",
            });
            // Banner settings
            if (data.data.bannerEnabled && data.data.bannerItems?.length > 0) {
              setBanner({
                enabled: true,
                bgColor: data.data.bannerBgColor || "#FDCF07",
                textColor: data.data.bannerTextColor || "#FFFFFF",
                items: data.data.bannerItems,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error checking settings:", error);
      }
    };
    checkSettings();
  }, []);

  // Filter nav links based on settings
  const filteredNavLinks = useMemo(() => {
    return NAV_LINKS.filter(link => {
      if (link.href === "/daily-pass" && !isDailyPassEnabled) {
        return false;
      }
      return true;
    });
  }, [isDailyPassEnabled]);

  useEffect(() => {
    const handleScroll = () => {
      // Don't update scroll state when menu is open
      if (!isMobileMenuOpen) {
        setIsScrolled(window.scrollY > 20);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Block body scroll when mobile menu is open (iOS compatible)
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Lock scroll - iOS compatible approach
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      // Get saved scroll position
      const scrollY = document.body.style.top;

      // Restore scroll
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
    };
  }, [isMobileMenuOpen]);

  // Pages with orange hero background
  const hasOrangeBg = ["/palestre", "/abbonamenti", "/nutrizione", "/daily-pass"].includes(pathname) || pathname.startsWith("/palestre/");

  // Duplicate banner items for seamless scroll
  const bannerItems = banner ? [...banner.items, ...banner.items, ...banner.items, ...banner.items] : [];

  return (
    <>
      {/* Banner - scrolls with page */}
      {banner && (
        <div
          className="py-3 overflow-hidden relative z-[60]"
          style={{ backgroundColor: banner.bgColor, color: banner.textColor }}
        >
          <div className="banner-scroll flex whitespace-nowrap items-center">
            {bannerItems.map((item, index) => {
              const IconComponent = bannerIconMap[item.icon] || Star;
              return (
                <div key={index} className="inline-flex items-center gap-4 px-10 text-lg font-bold">
                  <IconComponent size={22} className="flex-shrink-0" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
          <style jsx>{`
            .banner-scroll { animation: scroll 25s linear infinite; }
            @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .banner-scroll:hover { animation-play-state: paused; }
          `}</style>
        </div>
      )}

      {/* Header - fixed */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isMobileMenuOpen
            ? "bg-transparent py-5"
            : isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container">
          <nav className="flex items-center justify-between">
            {/* Left side: Logo + Navigation */}
            <div className="flex items-center gap-10">
              {/* Logo */}
              <Link href="/" className="relative z-[70]">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center"
                >
                  <Image
                    src="/images/logo.svg"
                    alt="24FIT"
                    width={120}
                    height={28}
                    className={`h-7 w-auto transition-all ${
                      isMobileMenuOpen
                        ? "brightness-0 invert"
                        : isScrolled
                        ? "brightness-0"
                        : "brightness-0 invert"
                    }`}
                    priority
                  />
                </motion.div>
              </Link>

              {/* Desktop Navigation - Now next to logo */}
              <div className="hidden md:flex items-center gap-8">
                {filteredNavLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={link.href}
                      className={`relative font-extrabold text-sm uppercase tracking-wider transition-colors ${
                        isScrolled
                          ? pathname === link.href
                            ? "text-[var(--brand)]"
                            : "text-gray-700 hover:text-[var(--brand)]"
                          : pathname === link.href
                          ? hasOrangeBg
                            ? "text-white"
                            : "text-[var(--brand)]"
                          : "text-white"
                      }`}
                    >
                      {link.label}
                      {pathname === link.href && (
                        <motion.div
                          layoutId="activeNav"
                          className={`absolute -bottom-1 left-0 right-0 h-0.5 ${
                            isScrolled
                              ? "bg-[var(--brand)]"
                              : hasOrangeBg
                              ? "bg-white"
                              : "bg-[var(--brand)]"
                          }`}
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right side: CTA Button - mostrato solo se app disponibile e link validi */}
            {!appComingSoon && appLinks.appStore && appLinks.appStore !== "#" && (
              <div className="hidden md:flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={appLinks.appStore}
                    className={`inline-flex items-center gap-2 font-bold text-xs uppercase tracking-wide py-2.5 px-5 rounded-full transition-all ${
                      isScrolled
                        ? "bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90"
                        : hasOrangeBg
                        ? "bg-white text-[var(--brand)] hover:bg-white/90"
                        : "bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90"
                    }`}
                  >
                    <Download size={14} />
                    Scarica App
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative z-[70] md:hidden p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X size={28} className="text-white" />
              ) : (
                <Menu
                  size={28}
                  className={isScrolled ? "text-black" : "text-white"}
                />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu - Outside header, using CSS transitions */}
      <div
        className={`fixed inset-0 bg-[var(--brand)] z-[60] pt-24 transition-all duration-300 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-5 right-6 p-2 text-white"
          aria-label="Chiudi menu"
        >
          <X size={32} strokeWidth={2.5} />
        </button>
        <div className="container">
          <nav className="flex flex-col gap-8">
            {filteredNavLinks.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-4xl font-black text-white ${
                    pathname === link.href ? "underline decoration-4 underline-offset-[12px]" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </div>
            ))}
            <div className="pt-8 flex flex-col gap-4">
              <Link
                href="/onboarding"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn bg-white text-[var(--brand)] hover:bg-white/90 w-full justify-center text-lg font-bold py-4"
              >
                Iscriviti oggi
              </Link>
              {!appComingSoon && appLinks.appStore && appLinks.appStore !== "#" && (
                <Link
                  href={appLinks.appStore}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 font-bold rounded-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-[var(--brand)] w-full py-3 transition-all duration-300"
                >
                  <Download size={18} />
                  Scarica App
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
