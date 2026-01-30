"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Clock } from "lucide-react";
import { CLUBS } from "@/data/constants";

export function ClubsPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-white" ref={ref}>
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block bg-[var(--brand)] text-white font-bold text-sm uppercase tracking-wider px-4 py-2 rounded-full"
            >
              I nostri club
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-3"
            >
              Trova il club
              <br className="md:hidden" />{" "}
              <span className="text-[var(--brand)]">più vicino a te</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/palestre"
              className="inline-flex items-center gap-2 font-semibold text-black hover:text-[var(--brand)] transition-colors"
            >
              Vedi tutti i club
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>

        {/* Clubs Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {CLUBS.map((club, index) => (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Link href={`/palestre/${club.slug}`} className="group block">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4">
                  {/* Club image */}
                  <img
                    src={index === 0
                      ? "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop&q=80"
                      : "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=500&fit=crop&q=80"
                    }
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="btn btn-primary">Scopri di più</span>
                  </div>

                  {/* 24/7 Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--brand)] text-white text-sm font-bold">
                    <Clock size={14} />
                    24/7
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--brand)] transition-colors">
                  {club.name}
                </h3>

                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin size={16} className="text-[var(--brand)]" />
                  <span>{club.fullAddress}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
