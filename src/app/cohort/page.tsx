import type { Metadata } from "next";
import { CohortContent } from "@/components/sections/CohortContent";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/cohort" },
  title: "Groundwork Cohort Program",
  description:
    "Groundwork is LWN's 9-month Christian leadership formation journey in Atlanta — three phases, three tracks, one purpose: to form Kingdom leaders before sending them.",
  openGraph: {
    title: "Groundwork Cohort Program | Living Water Network",
    description:
      "A 9-month discipleship-based formation journey for emerging Christian leaders — ministry, marketplace, and creative tracks.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Groundwork Cohort Program | Living Water Network",
    description:
      "A 9-month discipleship-based formation journey for emerging Christian leaders — ministry, marketplace, and creative tracks.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function CohortPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Cohort", path: "/cohort" }])),
        }}
      />
      <CohortContent />
    </>
  );
}
