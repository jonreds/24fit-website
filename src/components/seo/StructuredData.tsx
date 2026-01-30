import { CLUBS } from "@/data/constants";

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "24FIT",
    url: "https://24fit.it",
    logo: "https://24fit.it/images/logo.svg",
    description: "Palestre 24 ore su 24, 7 giorni su 7",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IT",
    },
    sameAs: [
      "https://www.instagram.com/24fit.it",
      "https://www.facebook.com/24fit.it",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "24FIT",
    url: "https://24fit.it",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://24fit.it/palestre?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const gymSchemas = CLUBS.map((club) => ({
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "@id": `https://24fit.it/palestre/${club.slug}`,
    name: `24FIT ${club.name}`,
    description: `Palestra 24 ore su 24 a ${club.city}`,
    url: `https://24fit.it/palestre/${club.slug}`,
    telephone: club.phone,
    email: club.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: club.address,
      addressLocality: club.city,
      addressRegion: club.province,
      addressCountry: "IT",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: club.coordinates.lat,
      longitude: club.coordinates.lng,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    priceRange: "€€",
    image: club.images[0] ? `https://24fit.it${club.images[0]}` : undefined,
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Accesso 24/7", value: true },
      { "@type": "LocationFeatureSpecification", name: "Aria Condizionata", value: true },
      { "@type": "LocationFeatureSpecification", name: "Spogliatoi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Docce", value: true },
    ],
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {gymSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
