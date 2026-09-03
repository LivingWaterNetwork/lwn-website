# Measure & Make — marketing website

A Next.js (App Router) application for Measure & Make. It lives in this
repository but is a separate application with its own `package.json`,
dependencies, Tailwind config, and build. Nothing in the Living Water Network
site or its `/yan` routes is imported or modified.

Every route is served under `/measure-and-make` (`basePath` in
`next.config.mjs`), matching where the site sits on the Living Water Network
domain while it shares that infrastructure.

## Routes

| Route                           | What it is                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `/measure-and-make`             | Landing page: hero, why, four capabilities, four-stage process, featured work, closing call to action |
| `/measure-and-make/about`       | Company-led narrative: lead, origin, philosophy, company stage, brand meaning, LWN relationship       |
| `/measure-and-make/work`        | All Public + Approved projects                                                                        |
| `/measure-and-make/work/[slug]` | Case study, one per approved project (three)                                                          |
| `/measure-and-make/services`    | The four capabilities in full, then the four-stage process                                            |
| `/measure-and-make/start`       | The inquiry form — the only contact route on the site                                                 |
| `/measure-and-make/privacy`     | Privacy Policy (complete; `noindex` pending legal approval)                                           |
| `/measure-and-make/terms`       | Terms of Service (complete; `noindex` pending legal approval)                                         |
| `/measure-and-make/sitemap.xml` | Static routes plus approved project slugs                                                             |
| `/measure-and-make/robots.txt`  | Allow-all, pointing at the sitemap                                                                    |
| 404                             | Any other path, including every unapproved project slug                                               |

## Source of truth

All brand rules, copy, and project data come from the approved content package
("Measure and Make Content Package"), except the About-page narrative and the
legal documents, which the owner supplied and approved directly.

| Package file                  | What it governs here                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| `01-BRAND-FOUNDATION.md`      | Palette (`tailwind.config.ts`), voice, logo rules, disclosure language |
| `02-WEBSITE-COPY.md`          | `src/content/copy.ts`, `capabilities.ts`, `process.ts`                 |
| `03-PROJECT-REGISTRY.json`    | `src/content/projects.ts` — transcribed verbatim                       |
| `04-CLAIMS-REGISTER.md`       | Which factual claims may appear at all                                 |
| `05-ASSET-INVENTORY.md`       | `public/brand/` — see `public/brand/INSTALLED-ASSETS.md`               |
| `07-DEVELOPER-CONTENT-MAP.md` | Component requirements and the publication gate                        |

## The publication gate

Only registry records with `visibility: "Public"` **and** a
`publicationApprovalStatus` beginning with `"Approved"` may reach a route, the
sitemap, structured data, an API response, or a client-side payload. Current
classifications, all enforced by one filter:

| Project                                     | Classification                 | On the site                                                    |
| ------------------------------------------- | ------------------------------ | -------------------------------------------------------------- |
| Living Water Network Digital Platform       | Public / Live                  | Yes                                                            |
| Young Adults Network (YAN) Digital Platform | Public / Live                  | Yes                                                            |
| Hand of Life Renovations                    | Public / Live                  | Yes                                                            |
| Redemption Cleanout Services                | Public / Live                  | Yes                                                            |
| Radiant Events Planning                     | Public / In Development        | Yes, with no outbound link — no live address is confirmed      |
| Organizational Operating System             | Public / Foundation & Strategy | Yes, as vision and architecture only — never as built software |

Hand of Life Renovations, Redemption Cleanout Services, and Radiant Events
Planning were approved for publication by the founder on 2026-09-03; the
Redemption record supersedes the earlier Private "Estate Cleanout &
Full-Property Services Website" record, whose slug now 404s like any other slug
that does not exist. Approval moved those records through the same gate as
everything else — it did not bypass it, and each record still carries the
claims it may not make.

How that is enforced:

- The filter lives at the data layer, in `src/content/projects.ts`, not in the UI.
- That module starts with `import "server-only"`, so the build fails if it is
  ever pulled into a client component. That is what keeps Draft and Private
  records out of every client bundle.
- Components accept the `PublicProject` type, which only the gate can produce.
- `generateStaticParams` enumerates approved slugs only, and `dynamicParams` is
  off, so an unapproved slug 404s rather than rendering anything.
- No structured data is emitted for any project, approved or not.
- `tests/publication-gate.test.ts` pins all of it.

## First-load brand reveal

`src/components/BrandIntro.tsx` with its stylesheet in `src/app/globals.css`.
A Deep Forest field, the Maker's Seal, the full Measure & Make lockup on a
Limestone plate with an Aged Brass rule and the line "Clarity before
construction.", then the field parts into two panels and retracts into the
homepage while the hero staggers in. Roughly 1.64s to a clear page and 1.8s to
a settled hero on desktop; 1.4s and 1.56s on a narrow screen.

- **Where.** The homepage only, once per browsing session (`sessionStorage`).
  No other Measure & Make route renders it, and nothing outside this app is
  touched.
- **Why it is CSS.** Every stage is a CSS animation that ends in its finished
  state, so the sequence completes even if the JavaScript fails or is off — the
  overlay cannot get stuck over the page. Script only decides whether to play
  it, holds scrolling while it does, and removes the node afterwards.
- **No fake loading.** The real page is server-rendered behind the overlay and
  waits on nothing — no font, image, API call, or hydration gate, and no
  spinner or percentage, because there is no progress to report. A brand asset
  stalled for 3s does not delay the retraction (checked in the QA sweep).
- **Accessibility.** `aria-hidden`, nothing focusable, no pointer events, so it
  can neither trap focus nor swallow a click; keyboard navigation works while
  it plays. With `prefers-reduced-motion: reduce` there is no sequence at all —
  every delay is cleared and the overlay is gone in one step.
- **Two things to know.** The reverse and stacked lockups still are not in the
  repository, so the name is revealed on a Limestone plate — the ground the
  supplied dark-ink artwork is drawn for — and nothing is filtered or inverted
  to fake a reverse version. And the seal precedes the lockup by ~500ms per the
  founder's brief for this sequence; the company is never introduced by the
  seal alone, and the seal has dissolved before the name inks in, so the mark
  is never on screen beside the lockup's own copy of it.

Sections 7 and 8 of `scripts/qa.mjs` pin the invariants: aria-hidden, nothing
focusable, no pointer events, removed from the DOM, scrolling restored, hero
settled, no replay in the same session, nothing held under reduced motion, and
no reveal on any other route.

## Contact form

`/measure-and-make/start` is the only contact route. The site publishes no email
address, telephone number, or postal address, and does not route Measure & Make's
commercial inquiries to Living Water Network's nonprofit inbox.
`tests/no-public-contact-details.test.ts` fails the build if any of that is
reintroduced.

Path of a submission:

1. The client posts to `POST /measure-and-make/api/contact`.
2. The route rate-limits per IP, validates with Zod server-side
   (`src/lib/contact-schema.ts`) — client-side validation is never trusted — and
   rejects any submission whose honeypot field is filled.
3. `src/lib/airtable.ts` writes a record to the **Measure & Make** base, table
   **Inquiries**.
4. Airtable's own automation emails the inbox on record creation.

The thank-you message appears only when the server confirms the record was
written. Every other outcome states what actually happened.

**Setup and the post-configuration test procedure:
[`docs/CONTACT-FORM-SETUP.md`](docs/CONTACT-FORM-SETUP.md).**

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000/measure-and-make
npm run verify     # format:check, lint, typecheck, test, build
```

Individually: `npm run format`, `npm run lint`, `npm run typecheck`,
`npm test`, `npm run build`.

## Relationship to the Living Water Network app

This app is built and deployed separately from the Living Water Network site in
the repository root. The root `tsconfig.json` excludes `measure-and-make` so the
two type-check independently — without that exclusion, the root build resolves
this app's `@/*` imports against the root `src/` and fails.

## Remaining production-launch requirements

1. **Install `AIRTABLE_API_KEY`** in the deployment environment, then run the
   test procedure in `docs/CONTACT-FORM-SETUP.md`.
2. **Enable the Airtable notification automation**, after changing its recipient
   to a Measure & Make address.
3. **Owner and attorney approval of the Privacy Policy and Terms of Service**,
   then remove the `noindex` on both pages and add them to the sitemap. See
   `docs/LEGAL-REVIEW-HANDOFF.md`.
4. **Install the remaining brand files** from
   `Measure-and-Make-Concept-03-5.zip` — the reverse and stacked lockups and the
   four PNG exports have not reached this repository. See
   `public/brand/INSTALLED-ASSETS.md`. Nothing has been substituted for them.

By design and not pending anything: there is no telephone number, postal
address, public email address, analytics, cookie banner, testimonial, rating,
metric, team-size claim, or years-of-experience claim anywhere on this site.
