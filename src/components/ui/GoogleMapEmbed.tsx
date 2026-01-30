"use client";

interface GoogleMapEmbedProps {
  address: string;
  className?: string;
}

export function GoogleMapEmbed({ address, className = "" }: GoogleMapEmbedProps) {
  const encodedAddress = encodeURIComponent(address);
  const mapUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

  return (
    <iframe
      src={mapUrl}
      className={`w-full h-full border-0 rounded-2xl ${className}`}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`Mappa di ${address}`}
    />
  );
}

interface MultiLocationMapProps {
  locations: Array<{
    name: string;
    address: string;
    lat: number;
    lng: number;
  }>;
  className?: string;
}

export function MultiLocationMap({ locations, className = "" }: MultiLocationMapProps) {
  // Per mostrare più location, usiamo il centro tra le due palestre
  const centerLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
  const centerLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

  // Creiamo una query con tutte le locations
  const query = locations.map(loc => loc.address).join(" | ");
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=10&output=embed`;

  return (
    <iframe
      src={mapUrl}
      className={`w-full h-full border-0 rounded-2xl ${className}`}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Mappa dei club 24FIT"
    />
  );
}
