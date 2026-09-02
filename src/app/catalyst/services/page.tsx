import type { Metadata } from "next";
import { CatalystServicesContent } from "@/components/catalyst/CatalystServicesContent";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/catalyst/services" },
  title: "Services",
  description:
    "Strategy and organizational architecture, websites and digital experiences, operations and automation, and initiative launches — the four areas Living Water Catalyst works in.",
  openGraph: {
    title: "Services | Living Water Catalyst",
    description:
      "Strategy, digital experiences, operations and automation, and initiative launches for mission-driven organizations.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | Living Water Catalyst",
    description:
      "Strategy, digital experiences, operations and automation, and initiative launches for mission-driven organizations.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function CatalystServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Catalyst", path: "/catalyst" },
              { name: "Services", path: "/catalyst/services" },
            ])
          ),
        }}
      />
      <CatalystServicesContent />
    </>
  );
}
