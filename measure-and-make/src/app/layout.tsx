import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { assetPath } from "@/lib/asset-path";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  BRAND_NAME,
  META_DESCRIPTION,
  SITE_URL,
  TITLE_TEMPLATE,
} from "@/content/site";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BRAND_NAME,
    template: TITLE_TEMPLATE,
  },
  description: META_DESCRIPTION,
  applicationName: BRAND_NAME,
  // The Maker's Seal is acceptable as a favicon: by the time a tab icon is read,
  // the full name has already led the page (01-BRAND-FOUNDATION.md §1,
  // 08-OPEN-DECISIONS.md #4).
  icons: { icon: assetPath("/brand/measure-make-makers-seal.svg") },
  openGraph: {
    title: BRAND_NAME,
    description: META_DESCRIPTION,
    siteName: BRAND_NAME,
    url: SITE_URL,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col">
        {/* First stop for a keyboard or screen-reader user on every page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-forest focus:bg-limestone-light focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:font-semibold focus:text-forest"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
