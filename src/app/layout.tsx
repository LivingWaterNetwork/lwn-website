import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Living Water Network",
    template: "%s | Living Water Network",
  },
  description:
    "Equipping Kingdom leaders to disrupt darkness and disciple nations. Transformative spiritual formation, discipleship, and leadership development.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://lwnetwork.org"),
  openGraph: {
    siteName: "Living Water Network",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
