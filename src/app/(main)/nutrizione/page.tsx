"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Apple,
  Target,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Phone,
  Salad,
  TrendingUp,
  Heart,
  Sparkles,
} from "lucide-react";

const OBIETTIVI = [
  { value: "dimagrimento", label: "Dimagrimento" },
  { value: "massa-muscolare", label: "Aumento massa muscolare" },
  { value: "alimentazione-sana", label: "Alimentazione sana" },
  { value: "performance", label: "Performance sportiva" },
  { value: "mantenimento", label: "Mantenimento peso" },
  { value: "altro", label: "Altro" },
];

const SERVIZI = [
  {
    icon: Target,
    title: "Piano Personalizzato",
    description:
      "Ogni piano alimentare è creato su misura per te, in base ai tuoi obiettivi, stile di vita e preferenze.",
  },
  {
    icon: Users,
    title: "Supporto Continuo",
    description:
      "Non sarai mai solo. Il nostro team ti seguirà passo dopo passo nel tuo percorso.",
  },
  {
    icon: Clock,
    title: "Consulenze Flessibili",
    description:
      "Consulenze in presenza o da remoto, per adattarci ai tuoi impegni.",
  },
  {
    icon: TrendingUp,
    title: "Monitoraggio Progressi",
    description:
      "Analisi periodiche per valutare i risultati e ottimizzare il tuo piano.",
  },
];

const VANTAGGI = [
  "Piano alimentare personalizzato",
  "Analisi composizione corporea",
  "Consulenze di follow-up incluse",
  "Supporto via chat",
  "Ricette e consigli pratici",
  "Integrazione con il tuo allenamento",
];

export default function NutrizionePage() {
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    obiettivo: "",
    messaggio: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/nutrizione", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        setError(data.error || "Si è verificato un errore. Riprova più tardi.");
      }
    } catch {
      setError("Si è verificato un errore. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.nome &&
    formData.cognome &&
    formData.email &&
    formData.telefono &&
    formData.obiettivo;

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition-all bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-[var(--brand)] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[var(--brand)] text-sm font-bold mb-6">
              <Apple size={16} />
              Nutrizione 24FIT
            </div>
            <h1 className="mb-6 text-white">
              Trasforma il tuo corpo con la giusta alimentazione
            </h1>
            <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">
              Un percorso nutrizionale personalizzato per raggiungere i tuoi obiettivi.
              Perché l&apos;allenamento da solo non basta.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "100+", label: "Clienti seguiti" },
              { value: "95%", label: "Soddisfazione" },
              { value: "24/7", label: "Supporto" },
              { value: "100%", label: "Personalizzato" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-black text-[var(--brand)]">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-1 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="pt-16 pb-20 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6">
                Il tuo alleato per{" "}
                <span className="text-[var(--brand)]">risultati concreti</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Sappiamo quanto sia difficile orientarsi nel mondo della nutrizione.
                Diete improvvisate, informazioni contrastanti, risultati che non arrivano.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Con il nostro servizio di nutrizione personalizzata, avrai un professionista
                dedicato che ti guiderà verso i tuoi obiettivi con un piano alimentare
                studiato appositamente per te.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Salad, text: "Piani alimentari bilanciati" },
                  { icon: Heart, text: "Focus sul benessere" },
                  { icon: Sparkles, text: "Risultati duraturi" },
                  { icon: Target, text: "Obiettivi realistici" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand)]/10 flex items-center justify-center">
                      <item.icon size={20} className="text-[var(--brand)]" />
                    </div>
                    <span className="font-medium text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/nutrizione-hero.jpg"
                  alt="Consulenza nutrizionale"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[var(--brand)] text-white p-6 rounded-2xl shadow-xl">
                <div className="text-3xl font-black">Prima consulenza</div>
                <div className="text-lg opacity-90">Gratuita</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="mb-4">I nostri servizi</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un approccio completo per accompagnarti in ogni fase del tuo percorso
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVIZI.map((servizio, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center mb-4">
                  <servizio.icon size={28} className="text-[var(--brand)]" />
                </div>
                <h3 className="text-xl font-bold mb-2">{servizio.title}</h3>
                <p className="text-gray-600">{servizio.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 bg-white" id="contatti">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6">
                Richiedi una{" "}
                <span className="text-[var(--brand)]">consulenza gratuita</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Lascia i tuoi dati e sarai ricontattato da un nostro esperto
                per fissare un appuntamento senza impegno.
              </p>

              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-[var(--brand)]" size={20} />
                  Cosa include la consulenza
                </h3>
                <ul className="space-y-3">
                  {VANTAGGI.map((vantaggio, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[var(--brand)]/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2
                          size={12}
                          className="text-[var(--brand)]"
                        />
                      </div>
                      <span className="text-gray-700">{vantaggio}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-4 p-4 bg-[var(--brand)]/10 rounded-xl">
                <Phone size={24} className="text-[var(--brand)]" />
                <div>
                  <p className="font-bold">Preferisci chiamare?</p>
                  <p className="text-gray-600">
                    Contattaci al{" "}
                    <a
                      href="tel:+390376134004"
                      className="text-[var(--brand)] font-bold"
                    >
                      0376 134 004
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {isSubmitted ? (
                <div className="bg-green-50 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    Richiesta inviata!
                  </h3>
                  <p className="text-green-700">
                    Grazie {formData.nome}! Ti contatteremo al più presto per
                    fissare la tua consulenza gratuita.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-gray-50 rounded-2xl p-8"
                >
                  <h3 className="text-xl font-bold mb-6">Compila il form</h3>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelClass}>Nome *</label>
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="Il tuo nome"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Cognome *</label>
                      <input
                        type="text"
                        name="cognome"
                        value={formData.cognome}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="Il tuo cognome"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className={labelClass}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="La tua email"
                    />
                  </div>

                  <div className="mb-4">
                    <label className={labelClass}>Telefono *</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="Il tuo numero"
                    />
                  </div>

                  <div className="mb-4">
                    <label className={labelClass}>Qual è il tuo obiettivo? *</label>
                    <select
                      name="obiettivo"
                      value={formData.obiettivo}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      <option value="">Seleziona un obiettivo</option>
                      {OBIETTIVI.map((ob) => (
                        <option key={ob.value} value={ob.value}>
                          {ob.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className={labelClass}>
                      Messaggio{" "}
                      <span className="text-gray-400 font-normal">(opzionale)</span>
                    </label>
                    <textarea
                      name="messaggio"
                      value={formData.messaggio}
                      onChange={handleChange}
                      rows={3}
                      className={inputClass}
                      placeholder="Raccontaci di più sui tuoi obiettivi..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className={`btn btn-primary w-full justify-center text-lg py-4 ${
                      !isFormValid || isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Invio in corso...
                      </>
                    ) : (
                      <>
                        Richiedi consulenza gratuita
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>

                  <p className="text-sm text-gray-500 text-center mt-4">
                    I tuoi dati sono al sicuro. Non condividiamo le tue
                    informazioni con terzi.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--brand)] text-white text-center">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-white mb-6">
              Inizia oggi il tuo percorso
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Non aspettare il lunedì, il mese prossimo o l&apos;anno nuovo.
              Il momento giusto per iniziare è adesso.
            </p>
            <a
              href="#contatti"
              className="btn bg-white text-[var(--brand)] hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg inline-flex"
            >
              Prenota la tua consulenza
              <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
