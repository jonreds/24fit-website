import { Metadata } from "next";
import { fetchClubs } from "@/lib/api";
import { PalestreContent } from "@/components/sections/PalestreContent";

export const metadata: Metadata = {
  title: "I nostri Club | 24FIT",
  description: "Trova la palestra 24FIT più vicina a te. Accesso 24/7, attrezzature all'avanguardia e la libertà di allenarti quando vuoi.",
};

export default async function PalestrePage() {
  const clubs = await fetchClubs();

  return <PalestreContent clubs={clubs} />;
}
