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

## Digital business card (connect.lwnetwork.org)

Omar Fandino's personal contact card, opened from a printed or on-screen QR
code. It is deliberately not a marketing page: no site nav, no site footer, no
donation CTA, no form.

It lives at **https://connect.lwnetwork.org**, served by its own Vercel project
(`omar-fandino-connect`) via a Wix-managed CNAME — not by this app. This repo
holds the card's source and builds it; `/connect` and `/connect/omar` here are
308 redirects to that address, kept only so links published before the subdomain
existed still work.

### Where to change things

Almost everything lives in one file: **`src/lib/connect/omar.ts`**.

| To change | Edit |
|---|---|
| Name, identity line, location | `IDENTITY` |
| Phone, email, LinkedIn | `CONTACT` (update the matching line in `VCARD_LINES` too) |
| Organization names, descriptors, links | `ORGANIZATIONS` |
| Button labels, share text, "Link Copied" | `SHARE`, `ORGANIZATIONS[].cta` |
| Open Graph / social preview copy | `SOCIAL` |
| QR modal heading and helper text | `QR_COPY` |
| Footer privacy note | `FOOTER_NOTE` |
| vCard fields | `VCARD_LINES` |
| Canonical URL (what the QR encodes) | `CANONICAL_URL` — see below |

Layout, styling and behavior are all in `scripts/build-standalone-card.mjs`,
which emits the whole site: plain HTML, CSS and ~40 lines of JS, no framework
and no build step at deploy time.

```bash
npm run build:card      # -> standalone-card/dist/
```

`standalone-card/dist/` is gitignored — rebuild it rather than committing it.

**Profile image.** Set `IDENTITY.headshot`. The current file,
`public/images/omar-headshot-pro.jpg`, is byte-identical to
`public/images/founder-headshot.jpg` — one asset saved twice; don't add a third
copy. The build resizes it (and the LWN logo) to what the layout actually
renders and copies both into `dist/assets/`; it never hotlinks
`www.lwnetwork.org/images/*`, which would break silently if those paths moved.

**Measure & Make mark.** `public/images/brand/measure-make-03-5-horizontal.svg`,
copied unmodified from the `LivingWaterNetwork/measure-and-make` repo's approved
package. Do not redraw, recolor, invert, or filter it, and never abbreviate the
name to "M&M" anywhere — including alt text. It is dark ink by design, so it
only ever sits on a light ground.

### vCard

`VCARD_LINES` joined with CRLF — RFC 6350 requires it and several phone
importers reject an LF-only file. Keep it as an array of lines; a template
literal would silently reintroduce LF endings. `dist/vercel.json` sets
`Content-Type: text/vcard; charset=utf-8` and `Content-Disposition: attachment`,
which Vercel cannot infer from the file extension.

### QR code

`src/lib/connect/qr.ts`, run at build time via the local `qrcode` package — no
third-party QR image endpoint, and no network dependency once the page has
loaded. It encodes `CANONICAL_URL` and nothing else, never contact fields. Both
`Omar-Fandino-QR.png` and `.svg` ship as static files.

> **The QR encodes `CANONICAL_URL` verbatim.** Changing that value invalidates
> every QR already printed or distributed, so change it only together with
> reissuing the QR.

### Deploying the card

The `omar-fandino-connect` project is linked per-directory, so deploy from
inside the build output — never from the repo root, where the CLI picks up this
repo's git remote and resolves to `lwn-website` instead:

```bash
npm run build:card
cd standalone-card/dist
npx vercel link --yes --scope living-water-network --project omar-fandino-connect
npx vercel deploy --scope living-water-network          # preview
npx vercel deploy --prod --scope living-water-network   # production
```

Expect an upload of roughly 170KB. If it reports tens of megabytes, it has
picked up the wrong directory — stop and re-check the link. `npm run build:card`
preserves `dist/.vercel`, so the link survives rebuilds.

Verify after deploying:

```bash
curl -sI https://connect.lwnetwork.org/Omar-Fandino.vcf | grep -i content-
```

### Tests

`tests/unit/connect-omar.test.ts` covers what fails silently and expensively:
the vCard's CRLF endings and field content, and a programmatic decode of the
generated QR asserting it matches `CANONICAL_URL` exactly. It exercises the same
`generateQrAssets` the build calls, so the QR shipped is the QR tested. Run with
`npm test`.

## Deployment

Deploys automatically to Vercel on push to `main`. Do not force-push or rewrite
history on `main`. Stripe webhook, Prisma migrations, and email credentials are
configured as Vercel environment variables — see `.env.example` for what's required.
