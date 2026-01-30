"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Users,
  Smartphone,
  Star,
  Zap,
  Heart,
  Gift,
  Trophy,
  Dumbbell,
  Flame,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  mapPin: MapPin,
  users: Users,
  smartphone: Smartphone,
  star: Star,
  zap: Zap,
  heart: Heart,
  gift: Gift,
  trophy: Trophy,
  dumbbell: Dumbbell,
  flame: Flame,
  sparkles: Sparkles,
};

interface BannerItem {
  text: string;
  icon: string;
}

interface BannerSettings {
  bannerEnabled: boolean;
  bannerBgColor: string;
  bannerTextColor: string;
  bannerItems: BannerItem[];
}

export function PromoBanner() {
  const [settings, setSettings] = useState<BannerSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings/sito");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSettings({
              bannerEnabled: data.data.bannerEnabled ?? false,
              bannerBgColor: data.data.bannerBgColor ?? "#FDCF07",
              bannerTextColor: data.data.bannerTextColor ?? "#FFFFFF",
              bannerItems: data.data.bannerItems ?? [],
            });
          }
        }
      } catch (error) {
        console.error("Error fetching banner settings:", error);
      }
    };

    fetchSettings();
  }, []);

  // Set CSS variable for banner height
  useEffect(() => {
    if (settings?.bannerEnabled && settings.bannerItems.length > 0) {
      document.documentElement.style.setProperty('--banner-height', '48px');
    } else {
      document.documentElement.style.setProperty('--banner-height', '0px');
    }
  }, [settings]);

  // Don't render if settings not loaded or banner disabled
  if (!settings || !settings.bannerEnabled || settings.bannerItems.length === 0) {
    return null;
  }

  // Duplicate items for seamless loop
  const items = [...settings.bannerItems, ...settings.bannerItems, ...settings.bannerItems, ...settings.bannerItems];

  return (
    <div
      className="py-3 overflow-hidden relative z-[60]"
      style={{ backgroundColor: settings.bannerBgColor, color: settings.bannerTextColor }}
    >
      <div className="banner-scroll flex whitespace-nowrap items-center">
        {items.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Star;
          return (
            <div
              key={index}
              className="inline-flex items-center gap-4 px-10 text-lg font-bold"
            >
              <IconComponent size={22} className="flex-shrink-0" />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .banner-scroll {
          animation: scroll 25s linear infinite;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .banner-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
