"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Dumbbell } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--brand)] flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 mb-6">
            <Dumbbell size={48} className="text-white" />
          </div>
          <h1 className="text-8xl md:text-9xl font-black text-white mb-4">404</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Pagina non trovata
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
            Ops! Sembra che questa pagina si sia persa durante l'allenamento.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/"
            className="btn bg-white text-[var(--brand)] hover:bg-white/90 transition-all duration-300 hover:scale-[1.02]"
          >
            <Home size={18} />
            Torna alla home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 font-bold rounded-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-[var(--brand)] px-6 py-3 transition-all duration-300"
          >
            <ArrowLeft size={18} />
            Torna indietro
          </button>
        </motion.div>
      </div>
    </div>
  );
}
