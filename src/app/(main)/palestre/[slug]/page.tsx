import { notFound } from "next/navigation";
import { Metadata } from "next";
import { fetchClubBySlug, getClubSlugs } from "@/lib/api";
import { ClubDetail } from "@/components/sections/ClubDetail";

interface ClubPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getClubSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: ClubPageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = await fetchClubBySlug(slug);

  if (!club) {
    return {
      title: "Club non trovato",
    };
  }

  return {
    title: club.name,
    description: `Palestra ${club.name} a ${club.city}. Accesso 24/7, attrezzature all'avanguardia. ${club.fullAddress}`,
  };
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { slug } = await params;
  const club = await fetchClubBySlug(slug);

  if (!club) {
    notFound();
  }

  return <ClubDetail club={club} />;
}
