import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lwnetwork.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/donate/success", "/partnership/thank-you", "/yan/admin"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
