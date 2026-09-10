import type { Metadata } from "next";
import Image from "next/image";

import { CardActions } from "@/components/connect/CardActions";
import { ArrowIcon, LinkedInIcon } from "@/components/connect/Icons";
import {
  CANONICAL_URL,
  CONTACT,
  FOOTER_NOTE,
  IDENTITY,
  ORGANIZATIONS,
  SOCIAL,
} from "@/lib/connect/omar";
import { generateQrAssets } from "@/lib/connect/qr";

/**
 * Omar Fandino's digital business card — opened from a QR scan, so mobile is
 * the primary target and everything above the fold is contact-first.
 *
 * Deliberately not a Living Water Network marketing page: no donation CTA, no
 * form, no nonprofit legal copy, and no site nav or footer (Navbar and Footer
 * self-hide on /connect, matching the pattern they already use for /yan).
 *
 * All copy lives in src/lib/connect/omar.ts. See the README section "Updating
 * the digital business card (/connect/omar)".
 */

const [LWN, MM] = ORGANIZATIONS;

export const metadata: Metadata = {
  title: SOCIAL.title,
  description: SOCIAL.description,
  alternates: { canonical: CANONICAL_URL },
  // A personal contact card reached by QR — it should not compete with the
  // organization's own pages in search. Also omitted from src/app/sitemap.ts.
  robots: { index: false, follow: true },
  openGraph: {
    type: "profile",
    title: SOCIAL.title,
    description: SOCIAL.description,
    url: CANONICAL_URL,
    images: [
      {
        url: IDENTITY.headshot,
        width: 1024,
        height: 1536,
        alt: IDENTITY.headshotAlt,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SOCIAL.title,
    description: SOCIAL.description,
    images: [{ url: IDENTITY.headshot, alt: IDENTITY.headshotAlt }],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: IDENTITY.name,
  jobTitle: "Founder",
  url: CANONICAL_URL,
  image: IDENTITY.headshot,
  email: CONTACT.email,
  telephone: "+14704759123",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Atlanta",
    addressRegion: "GA",
    addressCountry: "US",
  },
  worksFor: [
    { "@type": "Organization", name: LWN.name, url: LWN.url },
    { "@type": "Organization", name: MM.name, url: MM.url },
  ],
  sameAs: [CONTACT.linkedin],
};

export default async function OmarConnectPage() {
  // Generated on the server at build time — deterministic, local, and with no
  // third-party QR endpoint anywhere in the path.
  const qr = await generateQrAssets();

  return (
    <div className="min-h-screen bg-mm-limestone px-5 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      {/* Capped rather than stretched: desktop is a secondary view here. */}
      <div className="mx-auto w-full max-w-[30rem]">
        {/* 1 — Hero */}
        <header className="flex flex-col items-center text-center">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-1 ring-navy/10 sm:h-32 sm:w-32">
            <Image
              src={IDENTITY.headshot}
              alt={IDENTITY.headshotAlt}
              fill
              priority
              sizes="(min-width: 640px) 128px, 112px"
              className="object-cover object-top"
            />
          </div>

          <h1 className="mt-5 font-serif text-[1.75rem] font-semibold leading-tight text-navy sm:text-3xl">
            {IDENTITY.name}
          </h1>
          <p className="mt-2 max-w-[22rem] font-sans text-sm leading-relaxed text-slate">
            {IDENTITY.identityLine}
          </p>
          <p className="mt-2 font-sans text-xs uppercase tracking-[0.15em] text-slate">
            {IDENTITY.location}
          </p>
        </header>

        {/* 2 — Primary actions, and 6 — the QR trigger it sits with */}
        <section aria-label="Contact actions" className="mt-8">
          <CardActions qr={qr} />
        </section>

        {/* 3 & 4 — Organization cards: siblings, not twins. */}
        <section aria-label="Organizations" className="mt-10 space-y-4">
          {/* Not the shared .section-label: that class is LWN blue, and page
              chrome outside the two org cards has to stay neutral so it does
              not quietly favor one brand. */}
          <h2 className="text-center font-sans text-xs font-extrabold uppercase tracking-[0.15em] text-slate">
            Where I serve
          </h2>

          {/* Living Water Network — navy ground, copper action. */}
          <article className="overflow-hidden rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-center">
              <Image
                src={LWN.logo}
                alt={LWN.logoAlt}
                width={LWN.logoWidth}
                height={LWN.logoHeight}
                sizes="140px"
                className="h-auto w-[140px]"
              />
            </div>
            <p className="mt-4 text-center font-serif text-base leading-relaxed text-navy">
              {LWN.descriptor}
            </p>
            <a
              href={LWN.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={LWN.ctaAriaLabel}
              // .btn-copper's white-on-#C05A12 measures 4.46:1, just under the
              // 4.5:1 AA needs at this size. Darkened to copper-dark (5.93:1)
              // here only — the shared class is used across the site and is
              // not this card's to change.
              className="btn-copper mt-5 flex w-full min-h-[44px] gap-2 bg-copper-dark hover:bg-copper"
            >
              {LWN.cta}
              <ArrowIcon className="h-4 w-4" />
            </a>
          </article>

          {/* Measure & Make — limestone ground, forest and brass. Same card
              pattern, its own palette. The lockup is dark ink by design, so it
              stays on a light ground and is never filtered or inverted. */}
          <article className="overflow-hidden rounded-2xl border border-mm-forest/15 bg-mm-limestone-light p-6 shadow-sm">
            <div className="flex items-center justify-center">
              {/* A plain <img>, not next/image: routing an SVG through the
                  image optimizer would mean enabling dangerouslyAllowSVG
                  globally, which is not worth doing for one mark. Explicit
                  width/height keep the aspect box reserved, so no layout
                  shift either way. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={MM.logo}
                alt={MM.logoAlt}
                width={MM.logoWidth}
                height={MM.logoHeight}
                className="h-auto w-[220px]"
              />
            </div>
            <p className="mt-4 text-center font-sans text-sm leading-relaxed text-mm-field">
              {MM.descriptor}
            </p>
            <a
              href={MM.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={MM.ctaAriaLabel}
              className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-mm-forest px-6 py-3 font-sans text-sm font-semibold tracking-wide text-mm-limestone transition hover:bg-mm-forest-soft hover:shadow-md motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mm-forest focus-visible:ring-offset-2 focus-visible:ring-offset-mm-limestone-light"
            >
              {MM.cta}
              <ArrowIcon className="h-4 w-4" />
            </a>
          </article>
        </section>

        {/* 5 — LinkedIn: about Omar, so kept clear of both org cards. */}
        <a
          href={CONTACT.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View Omar Fandino's LinkedIn profile"
          className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-2xl border border-navy/15 bg-white px-4 py-3.5 font-sans text-sm font-semibold text-navy shadow-sm transition hover:border-navy/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-mm-limestone"
        >
          <LinkedInIcon className="h-5 w-5" />
          Connect on LinkedIn
        </a>

        {/* 7 — Footer */}
        <footer className="mt-12 border-t border-navy/10 pt-6 text-center">
          <p className="font-serif text-base text-navy">{IDENTITY.name}</p>
          <p className="mx-auto mt-1.5 max-w-[20rem] font-sans text-xs leading-relaxed text-slate/85">
            {FOOTER_NOTE}
          </p>
        </footer>
      </div>
    </div>
  );
}
