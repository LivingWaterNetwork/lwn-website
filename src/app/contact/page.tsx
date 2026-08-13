import type { Metadata } from "next";
import { ContactContent } from "@/components/sections/ContactContent";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Living Water Network — general inquiries, speaking requests, or major gifts and institutional partnerships.",
  openGraph: {
    title: "Contact Living Water Network",
    description:
      "General inquiries, speaking requests, or major gifts and institutional partnerships.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Living Water Network",
    description:
      "General inquiries, speaking requests, or major gifts and institutional partnerships.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
