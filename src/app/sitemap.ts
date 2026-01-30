import { MetadataRoute } from "next";
import { fetchClubs } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://24fit.it";

  // Fetch clubs from API
  const clubs = await fetchClubs();

  // Static pages
  const staticPages = [
    "",
    "/abbonamenti",
    "/palestre",
    "/daily-pass",
    "/privacy",
    "/termini",
    "/codice-etico",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic club pages from API
  const clubPages = clubs.map((club) => ({
    url: `${baseUrl}/palestre/${club.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...clubPages];
}
