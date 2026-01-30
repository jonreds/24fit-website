"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { PLANS, type Plan } from "@/data/constants";
import { fetchPublicPlans, type Plan as APIPlan } from "@/lib/api";

interface PlansPreviewProps {
  hideHeader?: boolean;
  hideDailyPass?: boolean;
  isAbbonamenti?: boolean;
  apiPlans?: APIPlan[];
}

export function PlansPreview({ hideHeader = false, hideDailyPass = false, isAbbonamenti = false, apiPlans }: PlansPreviewProps) {
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // State for plans from API
  const [plans, setPlans] = useState<(APIPlan | Plan)[]>(apiPlans || PLANS);
  const [isLoading, setIsLoading] = useState(!apiPlans);
  const [isDailyPassEnabled, setIsDailyPassEnabled] = useState(true);

  // Fetch plans from API on client side if not provided
  useEffect(() => {
    if (!apiPlans) {
      fetchPublicPlans().then((fetchedPlans) => {
        if (fetchedPlans.length > 0) {
          setPlans(fetchedPlans);
        }
        setIsLoading(false);
      });
    }
  }, [apiPlans]);

  // Check if Daily Pass is enabled
  useEffect(() => {
    const checkDailyPass = async () => {
      try {
        const response = await fetch("/api/settings/sito");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setIsDailyPassEnabled(data.data.dailyPassEnabled !== false);
          }
        }
      } catch (error) {
        console.error("Error checking daily pass:", error);
      }
    };
    checkDailyPass();
  }, []);

  // Reorder plans so the featured (popular) plan is always in the center for desktop
  const orderedPlans = useMemo(() => {
    if (plans.length !== 3) return plans;

    const featuredIndex = plans.findIndex(p => p.popular);
    if (featuredIndex === -1 || featuredIndex === 1) return plans; // Already centered or no featured

    // Create new array with featured plan in the center (index 1)
    const result = [...plans];
    const featured = result.splice(featuredIndex, 1)[0];
    result.splice(1, 0, featured);
    return result;
  }, [plans]);

  // Find the index of the featured plan in the original plans array (for mobile)
  const featuredPlanIndex = useMemo(() => {
    const index = plans.findIndex(p => p.popular);
    return index >= 0 ? index : 1; // Default to index 1 if no featured
  }, [plans]);

  // Default to the featured plan
  const [activePlanIndex, setActivePlanIndex] = useState(1);

  // Scroll to active plan when index changes (from toggle click)
  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth"
      });
    }
  };

  // Handle toggle click
  const handleToggleClick = (index: number) => {
    setActivePlanIndex(index);
    scrollToIndex(index);
  };

  // Handle scroll snap to update active index
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex !== activePlanIndex && newIndex >= 0 && newIndex < plans.length) {
        setActivePlanIndex(newIndex);
      }
    }
  };

  // Initial scroll to featured plan on mobile
  useEffect(() => {
    if (scrollRef.current && plans.length > 0) {
      const cardWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollLeft = cardWidth * featuredPlanIndex;
      setActivePlanIndex(featuredPlanIndex);
    }
  }, [featuredPlanIndex, plans.length]);

  // Card content component (shared between mobile and desktop)
  const CardContent = ({ plan }: { plan: APIPlan | Plan }) => {
    // Check if this plan has an active promo (from API)
    const promoPrice = 'promoPrice' in plan ? plan.promoPrice : null;
    const promoActive = 'promoActive' in plan ? plan.promoActive : false;
    const promoText = 'promoText' in plan ? plan.promoText : null;
    const hasPromo = promoActive && promoText;

    return (
    <>
      {/* Promo banner - sfondo nero */}
      {hasPromo && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black text-white text-xs font-bold">
          {plan.promoText}
        </div>
      )}

      {/* Popular badge */}
      {!hasPromo && plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-black text-white text-xs font-bold">
          <Star size={12} fill="currentColor" />
          Più scelto
        </div>
      )}

      {/* Custom badge for non-popular plans */}
      {!hasPromo && !plan.popular && plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-[var(--brand)] text-xs font-bold uppercase">
          {plan.badge}
        </div>
      )}

      {/* Plan name */}
      <h3 className={`text-xl font-bold mb-4 ${plan.popular ? "text-gray-900" : "text-white"}`}>
        {plan.name}
      </h3>

      {/* Price */}
      <div className="mb-2">
        {promoPrice != null ? (
          <>
            <span className="relative inline-block">
              <span className={`text-5xl font-black ${plan.popular ? "text-gray-900" : "text-white"}`}>
                {promoPrice}€
              </span>
              <span className={`absolute -top-1 -right-10 text-sm ${plan.popular ? "text-gray-400/50" : "text-white/40"}`}>
                {plan.price}€
              </span>
            </span>
            <span className={`text-sm ml-2 align-bottom ${plan.popular ? "text-gray-500" : "text-white/70"}`}>
              totale
            </span>
          </>
        ) : (
          <>
            <span className={`text-5xl font-black ${plan.popular ? "text-gray-900" : "text-white"}`}>
              {plan.price}€
            </span>
            <span className={`text-sm ml-2 ${plan.popular ? "text-gray-500" : "text-white/70"}`}>
              totale
            </span>
          </>
        )}
      </div>

      {/* Price per month - always use dynamic activationFee */}
      <p className={`text-sm mb-6 ${plan.popular ? "text-gray-500" : "text-white/70"}`}>
        Iscrizione {plan.activationFee}€ inclusa
      </p>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            {/* Tick tondo con cerchio */}
            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
              plan.popular
                ? "bg-[var(--brand)] text-white"
                : "bg-white text-[var(--brand)]"
            }`}>
              <Check size={12} strokeWidth={3} />
            </span>
            <span className={`text-sm ${plan.popular ? "text-gray-700" : "text-white/90"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA - use ctaText if available from API */}
      <Link
        href="/onboarding"
        className={`btn w-full justify-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
          plan.popular
            ? "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]"
            : "bg-white text-[var(--brand)] hover:bg-white/90"
        }`}
      >
        {'ctaText' in plan && plan.ctaText
          ? plan.ctaText
          : "Iscriviti ora"}
      </Link>
    </>
    );
  };

  return (
    <section
      className="bg-[var(--brand)] text-white"
      ref={ref}
      style={hideHeader ? { paddingTop: '2rem', paddingBottom: '2rem' } : undefined}
    >
      <div className="container">
        {/* Header */}
        {!hideHeader && (
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-2 rounded-full bg-white text-[var(--brand)] text-sm font-bold uppercase tracking-wider"
            >
              Abbonamenti
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-white"
            >
              <span className="md:whitespace-nowrap">Scegli il piano</span>
              <br className="md:hidden" />
              <span className="md:whitespace-nowrap"> perfetto per te</span>
            </motion.h2>
          </div>
        )}

        {/* Mobile Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="md:hidden flex justify-center mb-10"
        >
          <div className="inline-flex bg-white/20 rounded-full p-1">
            {plans.map((plan, index) => (
              <button
                key={plan.id}
                onClick={() => handleToggleClick(index)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  activePlanIndex === index
                    ? "bg-white text-[var(--brand)]"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {plan.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Mobile: Swipeable Cards - NO motion animation to prevent flicker */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pt-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex-shrink-0 w-full snap-center px-2"
            >
              <div className="max-w-sm mx-auto">
                <div
                  className={`relative rounded-2xl p-8 ${
                    plan.popular
                      ? "bg-white text-gray-900 shadow-2xl"
                      : "bg-white/10 backdrop-blur-sm border border-white/60"
                  }`}
                >
                  <CardContent plan={plan} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Plans Grid with motion animation - uses orderedPlans to center featured */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {orderedPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: 0.2 + index * 0.1,
                ease: "easeOut"
              }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-white text-gray-900 shadow-2xl md:scale-105 z-10"
                  : "bg-white/10 backdrop-blur-sm border border-white/60 z-0"
              }`}
            >
              <CardContent plan={plan} />
            </motion.div>
          ))}
        </div>

        {/* Daily Pass CTA */}
        {!hideDailyPass && isDailyPassEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-10"
          >
            <p className="text-white/80 mb-4 font-bold">Vuoi provare prima?</p>
            <Link
              href="/daily-pass"
              className="inline-flex items-center justify-center gap-2 font-bold rounded-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-[var(--brand)] px-6 py-3 transition-all duration-300"
            >
              Prova con un Daily Pass
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
