import type { Metadata } from "next";
import { ChurchAdvisoryContent } from "@/components/sections/ChurchAdvisoryContent";
import { breadcrumbJsonLd } from "@/lib/seo";

// Structurally identical to the sibling program pages, which hit a
// static-generation build timeout on Vercel — force-dynamic defensively
// for the same reason (see CLAUDE_HANDOFF.txt Section 7).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/programs/church-advisory" },
  title: "Church Advisory Services",
  description:
    "LWN Church Advisory Services works directly with church staff and leadership teams on volunteer recruitment and engagement, young adult ministry, small group leadership development, and overall ministry strategy.",
  openGraph: {
    title: "Church Advisory Services | Living Water Network",
    description:
      "Strategy and systems consulting for churches — volunteer engagement, young adult ministry, group leadership development, and ministry strategy.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Church Advisory Services | Living Water Network",
    description:
      "Strategy and systems consulting for churches — volunteer engagement, young adult ministry, group leadership development, and ministry strategy.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function ChurchAdvisoryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Programs", path: "/programs" },
              { name: "Church Advisory Services", path: "/programs/church-advisory" },
            ])
          ),
        }}
      />
      <ChurchAdvisoryContent />
    </>
  );
}
