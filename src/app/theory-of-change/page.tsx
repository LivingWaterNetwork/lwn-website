import type { Metadata } from "next";
import { TheoryOfChangeContent } from "@/components/sections/TheoryOfChangeContent";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/theory-of-change" },
  title: "Our Theory of Change",
  description:
    "How Living Water Network turns spiritual formation into measurable Kingdom impact — our logic model from inputs to outcomes to lasting change.",
  openGraph: {
    title: "Our Theory of Change | Living Water Network",
    description:
      "How Living Water Network turns spiritual formation into measurable Kingdom impact.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Theory of Change | Living Water Network",
    description:
      "How Living Water Network turns spiritual formation into measurable Kingdom impact.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function TheoryOfChangePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Theory of Change", path: "/theory-of-change" }])),
        }}
      />
      <TheoryOfChangeContent />
    </>
  );
}
