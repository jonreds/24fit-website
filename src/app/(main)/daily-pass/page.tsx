"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Gift, ArrowRight, Loader2 } from "lucide-react";
import { CLUBS, DAILY_PASS } from "@/data/constants";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export default function DailyPassPage() {
  const router = useRouter();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    birthDate: "",
    birthPlace: "",
    fiscalCode: "",
    address: "",
    city: "",
    postalCode: "",
    province: "",
    club: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if Daily Pass is enabled
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch("/api/settings/sito");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.dailyPassEnabled === false) {
            // Daily Pass is disabled, redirect to homepage
            router.replace("/");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking daily pass access:", error);
      }
      setIsCheckingAccess(false);
    };

    checkAccess();
  }, [router]);

  // Show loading while checking access
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)]" />
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const selectedClub = CLUBS.find(c => c.id === formData.club);

      const response = await fetch("/api/daily-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          clubId: formData.club,
          clubName: selectedClub?.name || "",
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL di checkout non disponibile");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Si è verificato un errore. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.nome &&
    formData.cognome &&
    formData.email &&
    formData.telefono &&
    formData.birthDate &&
    formData.birthPlace &&
    formData.address &&
    formData.city &&
    formData.postalCode &&
    formData.province &&
    formData.club;

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-[var(--brand)]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[var(--brand)] text-sm font-bold mb-6">
              <Gift size={16} />
              Prova la palestra
            </div>
            <h1 className="mb-6 text-white">
              Daily Pass
            </h1>
            <p className="text-xl text-white/80 font-semibold">
              Provaci per un allenamento.
              <br />
              Ne basta solo uno e non ci vorrai più abbandonare ;)
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="order-2 lg:order-1"
            >
              <h2 className="mb-6">Acquista il tuo pass</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nome e Cognome */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nome</label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      autoComplete="given-name"
                      className={inputClass}
                      placeholder="Nome"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Cognome</label>
                    <input
                      type="text"
                      name="cognome"
                      value={formData.cognome}
                      onChange={handleChange}
                      required
                      autoComplete="family-name"
                      className={inputClass}
                      placeholder="Cognome"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className={inputClass}
                    placeholder="E-mail"
                  />
                </div>

                {/* Telefono */}
                <div>
                  <label className={labelClass}>Telefono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                    className={inputClass}
                    placeholder="Numero di telefono"
                  />
                </div>

                {/* Data e Luogo di nascita */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Data di nascita</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      required
                      autoComplete="bday"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Luogo di nascita</label>
                    <input
                      type="text"
                      name="birthPlace"
                      value={formData.birthPlace}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="Città"
                    />
                  </div>
                </div>

                {/* Codice Fiscale */}
                <div>
                  <label className={labelClass}>Codice Fiscale</label>
                  <input
                    type="text"
                    name="fiscalCode"
                    value={formData.fiscalCode}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Codice Fiscale"
                    maxLength={16}
                    style={{ textTransform: "uppercase" }}
                  />
                </div>

                {/* Indirizzo */}
                <div>
                  <label className={labelClass}>Indirizzo di residenza</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    autoComplete="street-address"
                    className={inputClass}
                    placeholder="Indirizzo"
                  />
                </div>

                {/* Città, CAP, Provincia */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className={labelClass}>Città</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      autoComplete="address-level2"
                      className={inputClass}
                      placeholder="Città"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>CAP</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      autoComplete="postal-code"
                      className={inputClass}
                      placeholder="CAP"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Provincia</label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="Prov."
                      maxLength={2}
                      style={{ textTransform: "uppercase" }}
                    />
                  </div>
                </div>

                {/* Club */}
                <div>
                  <label className={labelClass}>Seleziona club</label>
                  <select
                    name="club"
                    value={formData.club}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Scegli il club...</option>
                    {CLUBS.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name} - {club.city}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className={`btn btn-primary w-full justify-center text-lg py-4 ${
                    !isFormValid || isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Elaborazione...
                    </>
                  ) : (
                    <>
                      Acquista {DAILY_PASS.price}€
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  Pagamento sicuro con Stripe. Riceverai la conferma via email.
                </p>
              </form>
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="order-1 lg:order-2"
            >
              <div className="bg-gray-50 rounded-2xl p-8 sticky top-28">
                {/* Price */}
                <div className="text-center mb-8 pb-8 border-b border-gray-200">
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                    Daily Pass
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl sm:text-6xl font-black">
                      {DAILY_PASS.price}€
                    </span>
                  </div>
                  <p className="text-gray-500 mt-2">
                    Valido per un allenamento
                  </p>
                </div>

                {/* Features */}
                <h3 className="font-bold mb-4">Cosa include:</h3>
                <ul className="space-y-4 mb-8">
                  {DAILY_PASS.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[var(--brand)]/10 flex items-center justify-center">
                        <Check size={14} className="text-[var(--brand)]" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Promo */}
                <div className="bg-[var(--brand)]/10 rounded-xl p-5 border-2 border-[var(--brand)]">
                  <div className="flex items-start gap-3">
                    <Gift size={24} className="text-[var(--brand)] shrink-0" />
                    <div>
                      <p className="font-bold text-black mb-1">
                        Sconto iscrizione!
                      </p>
                      <p className="text-sm text-gray-700">
                        Se ti iscrivi entro {DAILY_PASS.discountWithinDays}{" "}
                        giorni dalla prova.
                        <br />
                        <strong>Il Daily Pass viene scontato dall'abbonamento.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* How it works */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-bold mb-4">Come funziona:</h3>
                  <ol className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                        1
                      </span>
                      Compila il form e paga con carta
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                        2
                      </span>
                      Ricevi la conferma via email
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                        3
                      </span>
                      Presentati in reception negli orari indicati
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                        4
                      </span>
                      Allenati!
                    </li>
                  </ol>
                </div>

                {/* Hours info */}
                <div className="mt-6 p-4 bg-gray-100 rounded-xl">
                  <p className="text-sm text-gray-600 text-center">
                    <strong>Orari reception:</strong> Lun-Ven 10-13 e 16-20
                  </p>
                </div>
              </div>
            </motion.div>
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
          >
            <h2 className="text-white mb-6">
              Già convinto? Abbonati subito
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Risparmia tempo e denaro con un abbonamento.
              <br />
              Prezzi a partire da €32/mese.
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

      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} message="Stiamo preparando il pagamento..." />
    </>
  );
}
