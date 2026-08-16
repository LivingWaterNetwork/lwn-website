import type { Metadata } from "next";
import { DonateContent } from "@/components/sections/DonateContent";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Living Water Network, a 501(c)(3) Christian leadership nonprofit. Your tax-deductible gift helps launch the Groundwork cohort and equip Kingdom leaders.",
  openGraph: {
    title: "Donate | Living Water Network",
    description:
      "Support a 501(c)(3) Christian leadership nonprofit. Your tax-deductible gift helps equip Kingdom leaders.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Donate | Living Water Network",
    description:
      "Support a 501(c)(3) Christian leadership nonprofit. Your tax-deductible gift helps equip Kingdom leaders.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function DonatePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Donate", path: "/donate" }])),
        }}
      />
      <DonateContent />
    </>
  );
}
