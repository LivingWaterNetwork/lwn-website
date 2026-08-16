import type { Metadata } from "next";
import { EventsContent } from "@/components/sections/EventsContent";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/events" },
  title: "The Living Water Network Gala",
  description:
    "The Living Water Network Gala — a black-tie evening in Atlanta publicly launching the LWN movement. Request early access for this by-invitation event.",
  openGraph: {
    title: "The Living Water Network Gala | Living Water Network",
    description:
      "A black-tie evening publicly launching the Living Water Network movement — request early access.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Living Water Network Gala | Living Water Network",
    description:
      "A black-tie evening publicly launching the Living Water Network movement — request early access.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function EventsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Events", path: "/events" }])),
        }}
      />
      <EventsContent />
    </>
  );
}
