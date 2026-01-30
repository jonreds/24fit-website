"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { PLANS } from "@/data/constants";

interface PlansPreviewProps {
  hideHeader?: boolean;
  hideDailyPass?: boolean;
  isAbbonamenti?: boolean; // When true, buttons link to /onboarding and show "Iscriviti ora"
}

export function PlansPreview({ hideHeader = false, hideDailyPass = false, isAbbonamenti = false }: PlansPreviewProps) {
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Default to the popular plan (6 mesi, index 1)
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
      if (newIndex !== activePlanIndex && newIndex >= 0 && newIndex < PLANS.length) {
        setActivePlanIndex(newIndex);
      }
    }
  };

  // Initial scroll to center card (6 mesi)
  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollLeft = cardWidth; // Start at index 1
    }
  }, []);

  // Card content component (shared between mobile and desktop)
  const CardContent = ({ plan, isAbbonamenti: isAbbonamentiProp }: { plan: typeof PLANS[0]; isAbbonamenti?: boolean }) => (
    <>
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-black text-white text-xs font-bold">
          <Star size={12} fill="currentColor" />
          Più scelto
        </div>
      )}

      {/* Custom badge for non-popular plans */}
      {!plan.popular && plan.badge && (
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
        <span className={`text-5xl font-black ${plan.popular ? "text-gray-900" : "text-white"}`}>
          €{plan.price + plan.activationFee}
        </span>
        <span className={`text-sm ml-2 ${plan.popular ? "text-gray-500" : "text-white/70"}`}>
          totale
        </span>
      </div>

      {/* Price per month */}
      <p
        className={`text-sm mb-6 ${
          plan.popular ? "text-gray-500" : "text-white/70"
        }`}
      >
        €{plan.pricePerMonth}/mese + iscrizione
      </p>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <Check
              size={16}
              className={plan.popular ? "text-[var(--brand)]" : "text-white"}
            />
            <span
              className={`text-sm ${
                plan.popular ? "text-gray-600" : "text-white/90"
              }`}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={isAbbonamentiProp ? "/onboarding" : "/abbonamenti"}
        className={`btn w-full justify-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
          plan.popular
            ? "bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90"
            : "bg-white text-[var(--brand)] hover:bg-white/90"
        }`}
      >
        {isAbbonamentiProp ? "Iscriviti ora" : "Scegli piano"}
      </Link>
    </>
  );

  return (
    <section className={`bg-[var(--brand)] text-white ${hideHeader ? '!pt-0' : ''} ${hideDailyPass ? '!pb-8' : ''}`} ref={ref}>
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
          className={`md:hidden flex justify-center ${hideHeader ? 'mb-6' : 'mb-10'}`}
        >
          <div className="inline-flex bg-white/20 rounded-full p-1">
            {PLANS.map((plan, index) => (
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
          {PLANS.map((plan) => (
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
                  <CardContent plan={plan} isAbbonamenti={isAbbonamenti} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Plans Grid with motion animation */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, index) => (
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
              <CardContent plan={plan} isAbbonamenti={isAbbonamenti} />
            </motion.div>
          ))}
        </div>

        {/* Daily Pass CTA */}
        {!hideDailyPass && (
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
