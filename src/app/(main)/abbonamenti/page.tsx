"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Smartphone, Droplets, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { PlansPreview } from "@/components/sections/PlansPreview";

const faqs = [
  {
    question: "Come funziona l'accesso alla palestra?",
    answer: "Accedi ai club tramite l'app 24FIT prenotando l'accesso in una fascia oraria.\nUna volta entrato, puoi allenarti quanto vuoi.",
  },
  {
    question: "Qual è l'età minima per iscriversi?",
    answer: "L'età minima per entrare a far parte dei Club è 15 anni.\nPer i minorenni è richiesta la firma dei genitori o tutori legali.",
  },
  {
    question: "Posso sospendere l'abbonamento?",
    answer: "Sì, la sospensione permette di posticipare la data di scadenza dell'abbonamento.\nCon l'abbonamento da 6 mesi puoi sospendere fino a 2 settimane.\nCon l'abbonamento da 12 mesi puoi sospendere fino a 1 mese.",
  },
  {
    question: "Posso cedere l'abbonamento?",
    answer: "Sì, è possibile cedere l'abbonamento a terzi a fronte di un versamento una tantum di 99,00€ per la gestione delle spese amministrative e assicurative.",
  },
  {
    question: "Serve il certificato medico?",
    answer: "Sì, è richiesto il certificato medico per l'attività sportiva non agonistica.\nPuò essere presentato al momento dell'iscrizione o entro il primo accesso.",
  },
  {
    question: "Ci sono le docce?",
    answer: "Sì, le docce sono disponibili gratuitamente in tutti i club.\nGli spogliatoi sono dotati di docce e armadietti.",
  },
];

export default function AbbonamentiPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isDailyPassEnabled, setIsDailyPassEnabled] = useState(true);

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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[var(--brand)] pt-24 lg:pt-32 pb-2 overflow-hidden">
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-white text-[var(--brand)] text-sm font-bold uppercase tracking-wider mb-6">
              Abbonamenti
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white">
              Scegli il piano perfetto per te
            </h1>
            <p className="text-xl text-white/80 font-semibold">
              Accesso illimitato 24 ore su 24, 7 giorni su 7.
              <br />
              Nessun vincolo, massima flessibilità.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans Section */}
      <PlansPreview hideHeader hideDailyPass isAbbonamenti />

      {/* Features Section */}
      <section className="pt-8 pb-16 bg-[var(--brand)]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">
              Cosa include il tuo abbonamento
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Tutti i nostri piani includono accesso completo a servizi e attrezzature
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Clock,
                title: "Accesso 24/7",
                description: "Allenati quando vuoi 24/7.\nTutti i giorni dell'anno",
              },
              {
                icon: MapPin,
                title: "Tutti i club",
                description: "Accesso a tutti i club 24FIT\ncon un unico abbonamento",
              },
              {
                icon: Droplets,
                title: "Docce incluse",
                description: "Spogliatoi con docce e armadietti sempre disponibili",
              },
              {
                icon: Smartphone,
                title: "App 24FIT",
                description: "Gestisci il tuo abbonamento\ne accedi ai club dall'app",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-[var(--brand)]" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm whitespace-pre-line">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Domande <span className="text-[var(--brand)]">frequenti</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-gray-100"
                >
                  <h3 className="font-bold text-lg pr-4">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown size={24} className="text-[var(--brand)]" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0">
                        <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--brand)] text-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-white">
              Pronto a iniziare il tuo{" "}
              <span className="text-white">percorso fitness</span>?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Unisciti a oltre 500 membri che si allenano ogni giorno nei nostri club.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/onboarding"
                className="btn bg-white text-[var(--brand)] hover:bg-white/90 text-lg px-8 py-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                Iscriviti ora
                <ArrowRight size={20} />
              </Link>
              {isDailyPassEnabled && (
                <Link
                  href="/daily-pass"
                  className="inline-flex items-center justify-center gap-2 font-bold rounded-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-[var(--brand)] text-lg px-8 py-4 transition-all duration-300"
                >
                  Prova con un Daily Pass
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
