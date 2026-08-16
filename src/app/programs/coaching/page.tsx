import type { Metadata } from "next";
import { CoachingContent } from "@/components/sections/CoachingContent";
import { breadcrumbJsonLd } from "@/lib/seo";

// Structurally the same as the sibling program pages, which hit a static-
// generation build timeout on Vercel — force-dynamic defensively for the
// same reason (see CLAUDE_HANDOFF.txt Section 7).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/programs/coaching" },
  title: "Personal Coaching with Omar Fandino",
  description:
    "One-on-one Christian leadership coaching built around Living Water Network's Six Spheres formation framework. Not performance coaching — formation, for leaders who can't afford to keep pouring from an empty well.",
  openGraph: {
    title: "Personal Coaching | Living Water Network",
    description:
      "One-on-one coaching built around LWN's Six Spheres formation framework — the same model behind Groundwork, tailored to your life.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Coaching | Living Water Network",
    description:
      "One-on-one coaching built around LWN's Six Spheres formation framework — the same model behind Groundwork, tailored to your life.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function CoachingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Programs", path: "/programs" },
              { name: "Personal Coaching", path: "/programs/coaching" },
            ])
          ),
        }}
      />
      <CoachingContent />
    </>
  );
}
