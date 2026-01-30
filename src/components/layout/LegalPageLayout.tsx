"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  lastUpdate?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, lastUpdate, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[var(--brand)] py-10">
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-bold hover:opacity-80 transition-opacity mb-4">
            <ArrowLeft size={20} />
            Torna al sito
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white text-3xl md:text-4xl font-black"
          >
            {title}
          </motion.h1>
          {lastUpdate && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white mt-2 font-bold"
            >
              Ultimo aggiornamento: {lastUpdate}
            </motion.p>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="py-10">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="legal-content"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-[var(--brand)] py-8">
        <div className="container text-center">
          <Link href="/" className="text-2xl font-black text-white">
            24FIT
          </Link>
          <p className="text-white mt-2 font-medium">
            © {new Date().getFullYear()} 24FIT SRL. Tutti i diritti riservati.
          </p>
          <div className="flex justify-center gap-6 mt-4 flex-wrap">
            <Link href="/termini" className="text-white hover:opacity-80 font-bold transition-opacity">
              Termini e Condizioni
            </Link>
            <Link href="/codice-etico" className="text-white hover:opacity-80 font-bold transition-opacity">
              Codice Etico
            </Link>
            <Link href="/privacy" className="text-white hover:opacity-80 font-bold transition-opacity">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
