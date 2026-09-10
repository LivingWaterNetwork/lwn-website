# Living Water Network — Website

Production website for Living Water Network, a 501(c)(3) nonprofit. Next.js 14 (App
Router) + TypeScript + Tailwind, deployed on Vercel, with native Stripe donations,
Prisma/Neon-backed lead forms, Airtable pipeline sync, and Microsoft Graph/Resend email.

**This is a live production site** — real donors process payments through it and real
applicants submit program/cohort inquiries. Treat `main` accordingly.

## Stack

- **Framework:** Next.js 14 (App Router), TypeScript (strict)
- **Styling:** Tailwind CSS
- **Motion:** Framer Motion, via a shared vocabulary in `src/components/motion/`
- **Database:** Prisma → Postgres (Neon)
- **Payments:** Stripe (PaymentIntents for one-time, Customer+Subscription for recurring)
- **Email:** Resend (donor receipts) + Microsoft Graph (internal notifications, thank-you letters)
- **CRM/pipeline sync:** Airtable (cohort/program/partnership inquiries), Kit/ConvertKit (donor + newsletter contacts)
- **Blog:** MDX files under `content/blog`, rendered via `next-mdx-remote`
- **Validation:** Zod, shared schemas in `src/lib/validation.ts`

## Local development

```bash
npm install
cp .env.example .env.local   # fill in real values — see below
npm run dev
```

Runs at http://localhost:3000. For Stripe webhooks locally, run the Stripe CLI in a
second terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

and put the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | `prisma generate` + production build (also runs on Vercel) |
| `npm run start` | Run a production build locally |
| `npm run lint` | ESLint |
| `npm run db:push` | Push `prisma/schema.prisma` changes to the database |
| `npm run db:studio` | Prisma Studio (browse/edit DB rows) |

## Environment variables

See `.env.example` for the full list with descriptions (database, Stripe, Resend,
Microsoft Graph, cron secret). Never commit real values — `.env.local` is gitignored.

## Project structure

```
src/
  app/                    Routes (App Router). Each route's page.tsx is a server
                           component (metadata + JSON-LD only); it renders a
                           "use client" *Content.tsx component from
                           components/sections/ that does the actual UI.
  app/api/                Route handlers. Pattern: validate (Zod) → honeypot/rate-limit
                           check → prisma.create() → best-effort side effects
                           (Airtable push, notification email), each independently
                           try/caught so a side-effect failure doesn't fail the request.
  app/api/stripe/webhook/ Idempotent on stripePaymentId. Always returns 200 to Stripe
                           (logs errors instead) so Stripe doesn't infinitely retry.
  components/motion/      Shared motion primitives (FadeInSection, StaggerChildren,
                           RevealText, CountUp, SectionHeading, TiltCard, ParallaxLayer,
                           Lightbox) + the MotionConfig provider that gates everything
                           behind prefers-reduced-motion.
  components/layout/      Navbar, Footer.
  components/sections/    Per-page client content components and shared forms.
  lib/                    prisma client, email (Resend + Graph), airtable, kit,
                           validation (Zod schemas), rateLimit, seo (breadcrumb JSON-LD).
prisma/schema.prisma      Lead, CohortApplication, Donation, ContactSubmission,
                           ProgramInquiry, PartnershipInquiry, MultiYearPledgeInquiry,
                           GalaSponsorshipInquiry.
content/blog/             MDX blog posts.
```

## Forms & anti-abuse

Every public form (`cohort`, `contact`, `programs/inquire`, `partnership/*`,
`newsletter`) is Zod-validated server-side and protected by a hidden honeypot field
(`website`) plus a per-IP sliding-window rate limit (`src/lib/rateLimit.ts`). The
donate route is Zod-validated but has a more generous rate limit since legitimate
donors sometimes retry a card.

## SEO & search indexing

Every page has a self-referencing `alternates.canonical` and BreadcrumbList JSON-LD;
the homepage and blog posts additionally carry Organization/Article JSON-LD. The
sitemap (`src/app/sitemap.ts`) is the source of truth for known routes — add a new
route there when you ship one, or it won't be discoverable via sitemap.

**Google**: does not support push-based indexing for a normal site. The real levers
are (1) an accurate, complete sitemap — submit `https://lwnetwork.org/sitemap.xml` in
[Google Search Console](https://search.google.com/search-console) once, Google
re-fetches it periodically after that — and (2) Search Console's URL Inspection tool
to request indexing manually for a specific new/changed page.

**Bing/Yandex/etc.**: `GET /api/cron/indexnow` (auth: `Bearer $CRON_SECRET`) pushes
every sitemap URL to the [IndexNow](https://www.indexnow.org) protocol, which fans
out to participating engines within minutes instead of waiting on their own crawl
schedule. Not on an automatic schedule (the Vercel cron slot is already used by
`send-thank-you-letters`) — run it manually after a deploy that adds or meaningfully
changes pages:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://lwnetwork.org/api/cron/indexnow
```

## Digital business card (`/connect/omar`)

Omar Fandino's personal contact card, opened from a printed or on-screen QR code.
It is deliberately not a marketing page: no site nav, no site footer, no donation
CTA, no form. `Navbar` and `Footer` self-hide on any `/connect` path, the same way
they already do for `/yan`.

`/connect` is excluded from `src/app/sitemap.ts` and the page sets
`robots: { index: false }` — a personal contact card should not compete with the
organization's own pages in search. It stays reachable by anyone with the link.

### Where to change things

Almost everything lives in one file: **`src/lib/connect/omar.ts`**.

| To change | Edit |
|---|---|
| Name, identity line, location | `IDENTITY` |
| Phone, email, LinkedIn | `CONTACT` (update the matching line in `VCARD_LINES` too) |
| Organization names, descriptors, links, logos | `ORGANIZATIONS` |
| Button labels, share text, "Link Copied" | `SHARE`, `ORGANIZATIONS[].cta` |
| Open Graph / social preview copy | `SOCIAL` |
| QR modal heading and helper text | `QR_COPY` |
| Footer privacy note | `FOOTER_NOTE` |
| vCard fields | `VCARD_LINES` |
| Canonical URL (what the QR encodes) | `CANONICAL_URL` — see below |

Layout and styling are in `src/app/connect/omar/page.tsx`,
`src/components/connect/CardActions.tsx` (the four actions + QR trigger) and
`src/components/connect/QrModal.tsx`.

**Profile image.** Set `IDENTITY.headshot`. The current file,
`public/images/omar-headshot-pro.jpg`, is byte-identical to
`public/images/founder-headshot.jpg` — one asset saved twice; don't add a third
copy. Replacing it needs no code change as long as the path stays the same.

**Measure & Make mark.** `public/images/brand/measure-make-03-5-horizontal.svg`,
copied unmodified from the `LivingWaterNetwork/measure-and-make` repo's approved
package. Do not redraw, recolor, invert, or filter it, and never abbreviate the
name to "M&M" anywhere — including alt text. It is dark ink by design, so it only
ever sits on a light ground. Measure & Make's palette lives under the `mm-*`
Tailwind tokens, namespaced so it cannot collide with the LWN or YAN tokens.

### vCard

Served at `/connect/omar/Omar-Fandino.vcf` by
`src/app/connect/omar/Omar-Fandino.vcf/route.ts`. The route segment is named for
the file so the download keeps its filename on iOS Safari, which ignores
`Content-Disposition`. Content comes from `VCARD_LINES`, joined with CRLF — RFC
6350 requires it and several phone importers reject an LF-only file. Keep it as an
array of lines; a template literal would silently reintroduce LF endings.

### QR code

Generated at build time by `src/lib/connect/qr.ts` using the local `qrcode`
package — no third-party QR image endpoint, and no network dependency once the
page has loaded. It encodes `CANONICAL_URL` and nothing else, never contact
fields. Both downloads (`Omar-Fandino-QR.png`, `Omar-Fandino-QR.svg`) are produced
in the browser from that build-time output.

> **⚠️ The canonical URL is still a placeholder.**
> `CANONICAL_URL` defaults to `https://www.lwnetwork.org/connect/omar`, which has
> not been confirmed live. **The QR encodes this exact string.** Before printing
> the QR, putting it in an email signature, or distributing it in any form,
> replace it with the real deployed URL and rebuild so the QR regenerates.
> A preview deploy can point the QR at itself by setting
> `NEXT_PUBLIC_CONNECT_OMAR_URL` instead of editing source.

### Tests

`tests/unit/connect-omar.test.ts` covers the parts that fail silently and
expensively: vCard CRLF endings and field content, and a programmatic decode of
the generated QR asserting it matches `CANONICAL_URL` exactly. Run with
`npm test`. If you change the canonical URL or any vCard field, these tests are
what tell you the QR and the card still agree.

## Deployment

Deploys automatically to Vercel on push to `main`. Do not force-push or rewrite
history on `main`. Stripe webhook, Prisma migrations, and email credentials are
configured as Vercel environment variables — see `.env.example` for what's required.
