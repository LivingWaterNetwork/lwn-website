import type { Metadata } from "next";
import { MentorshipContent } from "@/components/sections/MentorshipContent";

// See src/app/programs/counseling/page.tsx for why this is forced dynamic
// (sibling route hit a static-generation build timeout; applied here too
// defensively since this page is structurally identical).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Christian Leadership Mentorship",
  description:
    "Discipleship-based mentorship pairing seasoned Christian leaders with emerging ones — iron sharpening iron, built around accountability and Kingdom vision.",
  openGraph: {
    title: "Christian Leadership Mentorship | Living Water Network",
    description:
      "Discipleship-based mentorship pairing seasoned Christian leaders with emerging ones.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Christian Leadership Mentorship | Living Water Network",
    description:
      "Discipleship-based mentorship pairing seasoned Christian leaders with emerging ones.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function MentorshipPage() {
  return <MentorshipContent />;
}
