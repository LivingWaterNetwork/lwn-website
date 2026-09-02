import type { Metadata } from "next";
import { CatalystStartContent } from "@/components/catalyst/CatalystStartContent";
import { breadcrumbJsonLd } from "@/lib/seo";

// Backed by a form that posts to the database — kept dynamic for the same
// reason as the other form-bearing pages on the site.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/catalyst/start" },
  title: "Start a Conversation",
  description:
    "Tell Living Water Catalyst what you're building and where it's getting stuck. Request a discovery conversation about strategy, systems, technology, or an initiative launch.",
  openGraph: {
    title: "Start a Conversation | Living Water Catalyst",
    description:
      "Tell us what you're building and where it's getting stuck. Request a discovery conversation.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Start a Conversation | Living Water Catalyst",
    description:
      "Tell us what you're building and where it's getting stuck. Request a discovery conversation.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function CatalystStartPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Catalyst", path: "/catalyst" },
              { name: "Start a Conversation", path: "/catalyst/start" },
            ])
          ),
        }}
      />
      <CatalystStartContent />
    </>
  );
}
