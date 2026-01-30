import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NEXT_PUBLIC_BASE_URL?.includes("24fit.it") &&
                       !process.env.NEXT_PUBLIC_BASE_URL?.includes("test.");

  if (isProduction) {
    // Production: allow all crawlers
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout/"],
      },
      sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
    };
  }

  // Test/staging: block all crawlers
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
