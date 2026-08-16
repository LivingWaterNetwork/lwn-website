import type { Metadata } from "next";
import { SpeakingContent } from "@/components/sections/SpeakingContent";
import { breadcrumbJsonLd } from "@/lib/seo";

// See src/app/programs/counseling/page.tsx for why this is forced dynamic
// (sibling route hit a static-generation build timeout; applied here too
// defensively since this page is structurally identical).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request a Christian Leadership Speaker",
  description:
    "Bring Living Water Network's message on Christian leadership, discipleship, and marketplace ministry to your church, conference, retreat, or corporate leadership event.",
  openGraph: {
    title: "Request a Speaker | Living Water Network",
    description:
      "Bring a message on Christian leadership, discipleship, and marketplace ministry to your church, conference, or event.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Request a Speaker | Living Water Network",
    description:
      "Bring a message on Christian leadership, discipleship, and marketplace ministry to your church, conference, or event.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function SpeakingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Programs", path: "/programs" },
              { name: "Public Speaking", path: "/programs/speaking" },
            ])
          ),
        }}
      />
      <SpeakingContent />
    </>
  );
}
