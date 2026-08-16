import type { Metadata } from "next";
import { AboutContent } from "@/components/sections/AboutContent";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About Us",
  description:
    "Learn about Living Water Network — our founder's story, our mission to equip Christian leaders through discipleship-based formation, and why we exist as an Atlanta-based 501(c)(3) nonprofit.",
  openGraph: {
    title: "About Living Water Network",
    description:
      "Our founder's story and our mission to equip Christian leaders through discipleship-based formation.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Living Water Network",
    description:
      "Our founder's story and our mission to equip Christian leaders through discipleship-based formation.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "About", path: "/about" }])),
        }}
      />
      <AboutContent />
    </>
  );
}
