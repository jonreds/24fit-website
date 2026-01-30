import { Metadata } from "next";

export const metadata: Metadata = {
  title: "24FIT - In Manutenzione",
  description: "Il sito è in manutenzione. Tornerà disponibile entro 24h.",
};

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#ffcf02] flex items-center justify-center p-8">
      <div className="text-center">
        <h1
          className="text-white text-3xl md:text-5xl lg:text-6xl leading-tight"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900 }}
        >
          Il sito è in manutenzione.
          <br />
          Tornerà disponibile entro 24h.
        </h1>
      </div>
    </div>
  );
}
