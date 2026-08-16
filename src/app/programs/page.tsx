import type { Metadata } from "next";
import { ProgramsPageContent } from "@/components/sections/ProgramsPageContent";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/programs" },
  title: "Christian Leadership Programs",
  description:
    "Explore Living Water Network's Christian leadership development programs: the Groundwork cohort, discipleship-based counseling, mentorship, speaking, and international mission trips.",
  openGraph: {
    title: "Christian Leadership Programs | Living Water Network",
    description:
      "Immersive cohorts, counseling, mentorship, speaking, and mission trips — Christian leadership development programs.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Christian Leadership Programs | Living Water Network",
    description:
      "Immersive cohorts, counseling, mentorship, speaking, and mission trips — Christian leadership development programs.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function ProgramsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Programs", path: "/programs" }])),
        }}
      />
      <ProgramsPageContent />
    </>
  );
}
