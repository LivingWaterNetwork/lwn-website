import type { Metadata } from "next";
import { Newsreader, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Living Water Network",
    template: "%s | Living Water Network",
  },
  description:
    "Equipping Kingdom leaders to disrupt darkness and disciple nations. Transformative spiritual formation, discipleship, and leadership development.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://lwnetwork.org"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    siteName: "Living Water Network",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Living Water Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Living Water Network",
      },
    ],
  },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lwnetwork.org";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  "@id": `${SITE_URL}/#organization`,
  name: "Living Water Network",
  alternateName: "LWN",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
  description:
    "Living Water Network is a Christian leadership-development nonprofit equipping Kingdom leaders through discipleship-based mentorship, counseling, marketplace ministry, and the Groundwork cohort program.",
  slogan: "Rooted in truth. Sent to lead.",
  email: "info@lwnetwork.org",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Atlanta",
    addressRegion: "GA",
    addressCountry: "US",
  },
  areaServed: "US",
  nonprofitStatus: "Nonprofit501c3",
  taxID: "93-1859873",
  knowsAbout: [
    "Christian leadership development",
    "Discipleship-based mentorship",
    "Spiritual formation",
    "Marketplace ministry",
    "Pastoral counseling",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${hanken.variable} ${newsreader.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
