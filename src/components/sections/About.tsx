"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { STATS } from "@/data/constants";
import { Clock, MapPin, Users } from "lucide-react";

const statIcons = {
  "24/7": Clock,
  "2": MapPin,
  "500+": Users,
};

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-white" ref={ref}>
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <img
                src="/images/fitness-fashion-forward-new-workout-wardrobe-scaled.jpg"
                alt="Interno palestra 24FIT"
                className="w-full h-full object-cover"
              />
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[var(--brand)] rounded-2xl -z-10" />
            </div>
          </motion.div>

          {/* Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block bg-[var(--brand)] text-white font-bold text-sm uppercase tracking-wider px-4 py-2 rounded-full"
            >
              Chi siamo
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-3 mb-6"
            >
              La libertà di allenarti{" "}
              <span className="text-[var(--brand)]">senza limiti</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-600 text-lg mb-6 leading-relaxed"
            >
              24FIT nasce dall'idea di rendere il fitness accessibile a tutti,
              in qualsiasi momento della giornata. Le nostre palestre sono aperte
              24 ore su 24, 7 giorni su 7, permettendoti di allenarti quando vuoi tu.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-600 text-lg mb-10 leading-relaxed"
            >
              Che tu sia un early bird o un nottambulo, con 24FIT hai la libertà
              di creare la tua routine di allenamento senza vincoli di orario.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 gap-6"
            >
              {STATS.map((stat, index) => {
                const Icon = statIcons[stat.value as keyof typeof statIcons] || Clock;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-center p-5 rounded-xl bg-[var(--brand)] shadow-lg cursor-pointer"
                  >
                    <Icon className="w-6 h-6 text-white mx-auto mb-2" />
                    <div className="text-3xl font-black text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/80 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
