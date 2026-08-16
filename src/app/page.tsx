import type { Metadata } from "next";
import { HomePageContent } from "@/components/sections/HomePageContent";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "Christian Leadership Development & Discipleship-Based Mentorship",
  description:
    "Living Water Network equips Kingdom leaders in Atlanta and beyond through discipleship-based mentorship, counseling, coaching, church advisory, marketplace ministry, and the Groundwork cohort program.",
  openGraph: {
    title: "Living Water Network | Christian Leadership Development",
    description:
      "Equipping Kingdom leaders through discipleship-based mentorship, counseling, coaching, and the Groundwork cohort program.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Living Water Network | Christian Leadership Development",
    description:
      "Equipping Kingdom leaders through discipleship-based mentorship, counseling, coaching, and the Groundwork cohort program.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function HomePage() {
  return <HomePageContent />;
}
