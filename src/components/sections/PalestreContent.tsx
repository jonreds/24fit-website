"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Clock, Phone, ArrowRight } from "lucide-react";
import { Club } from "@/data/constants";
import { GoogleMapEmbed } from "@/components/ui/GoogleMapEmbed";

// WhatsApp Icon
const WhatsAppIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-[var(--brand)]">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface PalestreContentProps {
  clubs: Club[];
}

export function PalestreContent({ clubs }: PalestreContentProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-[var(--brand)]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="mb-6 text-white">
              I nostri Club
            </h1>
            <p className="text-xl text-white/80 font-semibold">
              Trova la palestra 24FIT più vicina a te. Accesso 24/7, attrezzature
              all'avanguardia e la libertà di allenarti quando vuoi.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Clubs List */}
      <section className="bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8">
            {clubs.map((club, index) => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/palestre/${club.slug}`}
                  className="group block bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={index === 0
                        ? "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop&q=80"
                        : "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=450&fit=crop&q=80"
                      }
                      alt={club.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* 24/7 Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--brand)] text-white text-sm font-bold">
                      <Clock size={14} />
                      24/7
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-2xl font-bold group-hover:text-[var(--brand)] transition-colors">
                          {club.name}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <MapPin size={16} className="text-[var(--brand)]" />
                          <span>{club.fullAddress}</span>
                        </div>
                      </div>
                      <ArrowRight
                        size={24}
                        className="text-gray-300 group-hover:text-[var(--brand)] group-hover:translate-x-1 transition-all"
                      />
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <WhatsAppIcon size={14} />
                        {club.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-[var(--brand)]" />
                        {club.landline}
                      </div>
                    </div>

                    {/* Reception hours */}
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Orari reception
                      </p>
                      <p className="text-sm font-medium">{club.receptionHours}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-gray-50">
        <div className="container">
          <div className="text-center mb-10">
            <h2>
              Trova il club sulla{" "}
              <span className="text-[var(--brand)]">mappa</span>
            </h2>
          </div>

          {/* Maps Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {clubs.map((club) => (
              <div key={club.id} className="space-y-3">
                <h3 className="font-bold text-lg">{club.name}</h3>
                <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
                  <GoogleMapEmbed address={club.fullAddress} />
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <MapPin size={14} className="text-[var(--brand)]" />
                  {club.fullAddress}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--brand)] text-white text-center">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-white mb-6">
              Pronto ad allenarti?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Scegli l'abbonamento più adatto a te e inizia subito.
            </p>
            <Link
              href="/abbonamenti"
              className="btn bg-white text-[var(--brand)] hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              Vedi abbonamenti
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
