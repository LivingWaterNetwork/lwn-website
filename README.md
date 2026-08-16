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

## Deployment

Deploys automatically to Vercel on push to `main`. Do not force-push or rewrite
history on `main`. Stripe webhook, Prisma migrations, and email credentials are
configured as Vercel environment variables — see `.env.example` for what's required.
