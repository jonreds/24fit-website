"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { CreditCard, Smartphone, Dumbbell } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    title: "Scegli il piano",
    description: "Seleziona l'abbonamento più adatto alle tue esigenze: 3, 6 o 12 mesi.",
  },
  {
    icon: Smartphone,
    title: "Scarica l'app",
    description: "Accedi all'app 24FIT per gestire il tuo abbonamento e aprire i tornelli.",
  },
  {
    icon: Dumbbell,
    title: "Allenati 24/7",
    description: "Entra in palestra quando vuoi, 24 ore su 24, 7 giorni su 7.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-gray-50" ref={ref}>
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block bg-[var(--brand)] text-white font-bold text-sm uppercase tracking-wider px-4 py-2 rounded-full"
          >
            Come funziona
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3"
          >
            Inizia ad allenarti in
            <br />
            <span className="text-[var(--brand)]">3 semplici passi</span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="relative cursor-pointer"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gray-200">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--brand)]" />
                </div>
              )}

              <div className="relative bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-xl transition-shadow">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--brand)] text-white font-bold flex items-center justify-center text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-[var(--brand)]/10 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-[var(--brand)]" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 font-semibold">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
