import type { Metadata } from "next";
import { PartnershipContent } from "@/components/sections/PartnershipContent";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/partnership" },
  title: "Partner With Us",
  description:
    "Join the Living Water Network partnership circle. Sponsorship tiers, multi-year giving, and ways to invest in the next generation of Christian leaders in Atlanta and beyond.",
  openGraph: {
    title: "Partner With Us | Living Water Network",
    description:
      "Sponsorship tiers, multi-year giving, and ways to invest in the next generation of Christian leaders.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Partner With Us | Living Water Network",
    description:
      "Sponsorship tiers, multi-year giving, and ways to invest in the next generation of Christian leaders.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function PartnershipPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Partner With Us", path: "/partnership" }])),
        }}
      />
      <PartnershipContent />
    </>
  );
}
