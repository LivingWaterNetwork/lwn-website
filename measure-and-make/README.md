# Measure & Make — marketing website

A standalone Next.js (App Router) application for Measure & Make. It lives in
this repository for convenience but is a separate application: it has its own
`package.json`, dependencies, Tailwind config, and build. Nothing in the Living
Water Network site or its `/yan` routes is imported, modified, or shared.

## Source of truth

All brand rules, copy, project data, and factual constraints come from the
approved content package ("Measure and Make Content Package"). Nothing on this
site may be invented, supplemented, or inferred beyond it:

| Package file | What it governs here |
|---|---|
| `01-BRAND-FOUNDATION.md` | Palette (`tailwind.config.ts`), voice, logo rules, disclosure language |
| `02-WEBSITE-COPY.md` | `src/content/copy.ts`, `capabilities.ts`, `process.ts` |
| `03-PROJECT-REGISTRY.json` | `src/content/projects.ts` — transcribed verbatim |
| `04-CLAIMS-REGISTER.md` | Which factual claims may appear at all |
| `05-ASSET-INVENTORY.md` | `public/brand/` (see `public/brand/README-ASSETS.md`) |
| `07-DEVELOPER-CONTENT-MAP.md` | Route map, component requirements, the publication gate |

## The publication gate

Only registry records with `visibility: "Public"` **and** a
`publicationApprovalStatus` beginning with `"Approved"` may reach a route, the
sitemap, structured data, an API response, or a client-side payload.

- The filter lives at the data layer, in `src/content/projects.ts` — not in the UI.
- That module starts with `import "server-only"`, so the build fails if it is
  ever pulled into a client component. That is what keeps Draft and Private
  records out of every client bundle.
- Components accept the `PublicProject` type, which only the gate can produce.
- `tests/publication-gate.test.ts` asserts the gate's behavior, including that a
  Draft or Private slug is indistinguishable from a slug that does not exist.

## Contact form and its destination

The form on `/contact` has a real destination: submissions are stored in
Airtable and the inbox is notified. There is deliberately **no database and no
Prisma model** for it, and Living Water Network's database is not touched.

Path of a submission:

1. The client posts to `POST /api/contact`.
2. `src/app/api/contact/route.ts` rate-limits per IP, then validates with Zod
   (`src/lib/contact-schema.ts`) — client-side validation is never trusted — and
   rejects any submission whose honeypot field is filled.
3. `src/lib/airtable.ts` writes a record to the **Measure & Make** base, table
   **Inquiries** (`appKznUQ11agoIbcs` / `tblgc13tluLMgJHgo`).
4. Airtable's own `Email new inquiry to info@lwnetwork.org` automation emails the
   inbox on record creation. `src/lib/notify.ts` can send a second notification
   through Resend, but only if `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` are set;
   a failure there never fails a submission that was already saved.

The success message appears only when the server confirms the record was
written. Every other outcome says what actually happened and points to
`info@lwnetwork.org`:

| Server result | What the visitor sees |
|---|---|
| `ok` | The approved thank-you message |
| `invalid` | The validation error, with the offending fields marked |
| `rate-limited` | Too many messages from this connection; not sent |
| `not-configured` | The form is not connected to its inbox here; nothing was saved |
| `failed` | Something went wrong on our end; not sent |

Copy `.env.example` to `.env.local` and fill in `AIRTABLE_API_KEY` to make the
form live locally. With it unset, the form reports `not-configured` rather than
faking a delivery.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm test        # publication-gate and brand-rule tests
npm run lint
```

## Build status

- **Phase 1 (site shell)** — complete: layout, navigation, footer with the
  shared `RelationshipDisclosure`, palette and type, approved logo lockup.
- **Phase 2 (landing page)** — complete: hero, capability cards, process,
  featured work from the gate, closing call to action, 404 page.
- **Phase 3 (remaining routes)** — complete: `/work`, `/work/[slug]`,
  `/capabilities`, `/process`, `/about`, `/contact`, `/privacy`, `/terms`,
  `sitemap.xml`, `robots.txt`, 404, Organization JSON-LD, and the contact form
  with its Airtable destination.

## Known gaps, deliberately left open

These are unresolved in the content package and are not filled in with
plausible-sounding substitutes:

- **`info@lwnetwork.org` is the only contact detail that exists.** No phone
  number and no physical address were supplied, so neither appears anywhere.
- **Two switches are still off**, and the form cannot deliver until both are on:
  `AIRTABLE_API_KEY` must be set in the deployment environment, and the
  Airtable automation is saved as a draft — it must be reviewed and turned on in
  the Airtable UI before it sends anything.
- **No Airtable form share link.** Airtable form views cannot be created through
  the API. Set `NEXT_PUBLIC_AIRTABLE_FORM_URL` to a real share link and the
  contact page will offer it as an alternative; unset, no link renders.
- **The live Airtable write is untested from this environment** — no API token
  was available here. The field names in `src/lib/airtable.ts` match the table
  as created, and the route's behavior is covered by
  `tests/contact-route.test.ts` against a mocked Airtable.
- **Reverse and stacked lockups and all PNG exports are missing** from the Drive
  package. Brand-lockup areas therefore sit on light grounds so the supplied
  dark-ink lockup renders as drawn. No reverse version has been recreated.
- **About page founder narrative and company-stage language** are visible
  placeholders (Open Decisions #2).
- **Privacy Policy and Terms of Service** are placeholders and are a hard launch
  blocker (Open Decisions #6) — more so now that the contact form collects
  personal information. Both pages carry a visible pending marker, are excluded
  from the sitemap, and are set to `noindex` until the copy is real.
- **No analytics and no consent banner** (Open Decisions #5).
- **No testimonials, metrics, ratings, team size, or years of experience**
  anywhere, and no review/rating structured data.
