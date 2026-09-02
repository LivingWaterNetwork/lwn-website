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
- **Phase 3 (remaining routes)** — not started, pending checkpoint approval:
  `/work`, `/work/[slug]`, `/capabilities`, `/process`, `/about`, `/contact`,
  `/privacy`, `/terms`, sitemap, `robots.txt`.

## Known gaps, deliberately left open

These are unresolved in the content package and are not filled in with
plausible-sounding substitutes:

- **No contact email, phone, or address** (Claims Register row 20, Open
  Decisions #3). `CONTACT_DETAILS_PENDING` in `src/content/site.ts` renders a
  visible pending note wherever contact details would go.
- **No contact-form destination**, so no persistence layer and no database model
  exist for it yet, and no success state may claim a message was delivered.
- **Reverse and stacked lockups and all PNG exports are missing** from the Drive
  package. Brand-lockup areas therefore sit on light grounds so the supplied
  dark-ink lockup renders as drawn. No reverse version has been recreated.
- **About page founder narrative and company-stage language** are visible
  placeholders (Open Decisions #2).
- **Privacy Policy and Terms of Service** are placeholders and are a hard launch
  blocker (Open Decisions #6).
- **No analytics and no consent banner** (Open Decisions #5).
- **No testimonials, metrics, ratings, team size, or years of experience**
  anywhere, and no review/rating structured data.
