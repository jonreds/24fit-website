"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  ArrowLeft,
  ArrowRight,
  Navigation,
  CheckCircle,
} from "lucide-react";
import { Club } from "@/data/constants";

// WhatsApp Icon
const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
import { GoogleMapEmbed } from "@/components/ui/GoogleMapEmbed";

interface ClubDetailProps {
  club: Club;
}

export function ClubDetail({ club }: ClubDetailProps) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    club.fullAddress
  )}`;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-[var(--brand)] text-white">
        <div className="container">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href="/palestre"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft size={18} />
              Tutti i club
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* 24/7 Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[var(--brand)] text-sm font-bold mb-4">
                <Clock size={14} />
                Aperto 24/7
              </div>

              <h1 className="mb-4 text-white">{club.name}</h1>

              <div className="flex items-center gap-2 text-white/80">
                <MapPin size={20} className="text-white" />
                <span className="text-lg">{club.fullAddress}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap gap-3"
            >
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-bold rounded-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-[var(--brand)] px-5 py-2.5 transition-all duration-300"
              >
                <Navigation size={18} />
                Indicazioni
              </a>
              <Link
                href="/onboarding"
                className="btn bg-white text-[var(--brand)] hover:bg-white/90 transition-all duration-300 hover:scale-[1.02]"
              >
                Iscriviti ora
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white py-0">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-10">
            {/* Main large image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="col-span-2 row-span-2 aspect-auto rounded-xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=800&fit=crop&q=80"
                alt="Interno palestra 24FIT"
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Smaller images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="aspect-square rounded-xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=400&fit=crop&q=80"
                alt="Area cardio"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="aspect-square rounded-xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=400&fit=crop&q=80"
                alt="Pesi liberi"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="aspect-square rounded-xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop&q=80"
                alt="Area funzionale"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="aspect-square rounded-xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400&h=400&fit=crop&q=80"
                alt="Attrezzature moderne"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <h2 className="mb-6">
                Informazioni <span className="text-[var(--brand)]">Club</span>
              </h2>

              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                Il club {club.name} ti offre un ambiente moderno e attrezzato
                per il tuo allenamento, accessibile 24 ore su 24, 7 giorni su 7.
              </p>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Con la nostra app, puoi accedere alla palestra in qualsiasi momento
                e goderti la massima libertà nel tuo percorso fitness.
              </p>

              {/* Features */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Attrezzature</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {club.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <CheckCircle size={18} className="text-[var(--brand)]" />
                      <span className="font-medium text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
                <GoogleMapEmbed address={club.fullAddress} />
              </div>
              <div className="mt-3 flex justify-end">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--brand)] text-sm font-medium hover:underline inline-flex items-center gap-1"
                >
                  <Navigation size={14} />
                  Apri in Google Maps
                </a>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="sticky top-28 space-y-6">
                {/* Contact Card */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Contatti</h3>

                  <div className="space-y-4">
                    <a
                      href={`https://wa.me/39${club.phone.replace(/\s/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-600 hover:text-[var(--brand)] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--brand)]/10 flex items-center justify-center text-[var(--brand)]">
                        <WhatsAppIcon size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">WhatsApp</p>
                        <p className="font-medium text-black">{club.phone}</p>
                      </div>
                    </a>

                    <a
                      href={`tel:${club.landline.replace(/\s/g, "")}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-[var(--brand)] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--brand)]/10 flex items-center justify-center">
                        <Phone size={18} className="text-[var(--brand)]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Telefono</p>
                        <p className="font-medium text-black">{club.landline}</p>
                      </div>
                    </a>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--brand)]/10 flex items-center justify-center">
                        <MapPin size={18} className="text-[var(--brand)]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Indirizzo</p>
                        <p className="font-medium text-black">{club.address}</p>
                        <p className="text-sm text-gray-500">
                          {club.city} ({club.province})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hours Card */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Orari</h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Clock size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-green-600">Palestra</p>
                        <p className="text-2xl font-black">24/7</p>
                        <p className="text-sm text-gray-500">
                          Sempre aperta per gli iscritti
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                        Reception
                      </p>
                      <p className="font-medium">{club.receptionHours}</p>
                      <p className="text-sm text-gray-500">Lun - Ven</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/onboarding"
                  className="btn btn-primary w-full justify-center"
                >
                  Iscriviti ora
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
