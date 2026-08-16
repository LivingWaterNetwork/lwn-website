# YAN Atlanta — Build & Editor Guide

This document is the operational handoff for the `/yan` mini-site built inside the
Living Water Network (`lwnetwork.org`) codebase. It covers what was built, how to
manage content, what's required before launch, and what still needs human review.

## 1. Executive summary

`/yan` is a full mini-site for **YAN Atlanta / Young Adults Network Atlanta**,
Living Water Network's initiative connecting Atlanta's existing young-adult
ministries, groups, pastors, and leaders. It has its own navy/blue brand system,
navigation, footer, and eight public routes, all backed by new Prisma models and a
lightweight authenticated admin at `/yan/admin`. It reuses the existing Next.js App
Router, Tailwind, Framer Motion, Prisma/Postgres, and Resend/Graph email systems —
no new backend, CMS, or infrastructure stack was introduced.

Every route has a real, on-brand "coming soon" / zero-data state, since no real
groups, leaders, events, resources, or stories exist yet — the site is designed to
go from empty to populated without any redesign.

## 2. Final route map

| Route | Purpose |
|---|---|
| `/yan` | Movement home — hero, gateway CTA, pillars, network story, roundtable preview, faith foundation |
| `/yan/network` | Ministry/group directory (list + lightweight area-grouped "map" view), search/filter, add-your-group |
| `/yan/events` | Event list + `/yan/events/[slug]` detail with registration/waitlist and add-to-calendar |
| `/yan/leaders` | Leader/ministry spotlights + nomination form |
| `/yan/pray` | Prayer themes + private/anonymized prayer request form (crisis-line language included) |
| `/yan/resources` | Resource library + submission form |
| `/yan/stories` | Testimonies/movement stories + submission form (explicit consent required) |
| `/yan/join` | Multi-path application (6 pathways, progressive disclosure) |
| `/yan/admin` | Password-gated content admin (see §5) |

The main LWN site links in via a **Footer quick link** ("YAN Atlanta") and a
restrained **feature panel on `/programs`** introducing YAN as a citywide
initiative — no changes to the primary hero or main navigation.

## 3. New and materially changed files

**New — brand & design system**
`src/components/yan/brand/{YanMark,YanLogo}.tsx`, YAN Tailwind tokens in
`tailwind.config.ts` (`yan-navy`, `yan-blue`, `yan-clay`, `yan-sage`, `yan-stone`,
`font-yan-heading`/`font-yan-body`), YAN component classes appended to
`src/app/globals.css` (all `yan-` prefixed, isolated from existing classes).

**New — layout & primitives**
`src/components/yan/layout/{YanNavbar,YanFooter}.tsx`, `src/app/yan/layout.tsx`
(loads Poppins/Manrope, mounts YAN nav/footer), `src/components/yan/primitives/YanEmptyState.tsx`,
`src/components/yan/gateway/MovementGateway.tsx`, `src/components/yan/icons/PillarIcons.tsx`.

**New — public pages & forms**
`src/app/yan/{page,network,events,events/[slug],leaders,pray,resources,stories,join}/*`,
matching `src/components/yan/sections/*Form.tsx` client components.

**New — backend**
`prisma/schema.prisma` (11 new `Yan*` models, see §4), `src/lib/yanValidation.ts`
(Zod schemas), `src/lib/yanData.ts` (safe-query wrapper), `src/lib/yanIcs.ts`
(calendar export), `src/lib/yanAnalytics.ts` (event helper), `src/app/api/yan/**/*`
(public submission routes).

**New — admin**
`src/lib/yanAdmin{Auth,Schema,Delegate,Coerce}.ts`, `src/middleware.ts` (scoped to
`/yan/admin*` and `/api/yan/admin*` only), `src/app/yan/admin/**/*`,
`src/app/api/yan/admin/**/*`.

**New — imagery & tests**
`public/images/yan/source/*.jpg` + `MANIFEST.md` (license records), `tests/unit/yanValidation.test.ts`,
`tests/e2e/yan.spec.ts`, `vitest.config.ts`, `playwright.config.ts`.

**Modified (minimal, backward-compatible)**
- `src/components/layout/Navbar.tsx` / `Footer.tsx` — return `null` under `/yan/*` so the YAN mini-site owns its own chrome; Footer gained one new "YAN Atlanta" link.
- `src/components/sections/ProgramsPageContent.tsx` — one new section introducing YAN; no existing content removed.
- `src/app/sitemap.ts` — 8 new `/yan/*` entries appended.
- `src/app/robots.ts` — added `/yan/admin` to the disallow list.
- `package.json` — added `test`, `test:watch`, `test:e2e` scripts and `vitest`/`@playwright/test` devDependencies.

Nothing outside these files was touched. No existing route, model, or table was renamed, removed, or altered.

## 4. Database / schema changes

11 new Prisma models were added, all namespaced `Yan*` → `yan_*` tables:
`YanGroup`, `YanLeader`, `YanEvent`, `YanEventRegistration`, `YanResource`,
`YanStory`, `YanPrayerTheme`, `YanPrayerRequest`, `YanJoinSubmission`, `YanSubscriber`.

**This repo has no migration-file history** — it uses `npm run db:push` (Prisma
schema push) against Neon. Per your instruction, **no migration was applied to the
live database in this session** — `prisma generate` was run (regenerates the
TypeScript client only, no DB connection), but the actual tables do not exist yet.

**Before launch, run:**
```bash
npm run db:push
```
against the real `DATABASE_URL`. Until that's done, every `/yan` page still
renders correctly — all Prisma reads go through `safeYanQuery()`
(`src/lib/yanData.ts`), which catches the "table does not exist" error and falls
back to the empty/coming-soon state already designed for that route. This was
verified locally: every YAN route returns 200 and renders its empty state
against an unreachable database.

## 5. CMS / editor instructions

Admin lives at **`/yan/admin`**, gated by a single shared password (see §7 for the
env var). It is intentionally lightweight — not a full generic CMS — scoped only
to the 9 YAN models editors need to manage directly: Groups, Leaders, Events,
Resources, Stories, Prayer Themes, Prayer Requests, Join Submissions, Subscribers.

**To manage content:**
1. Go to `/yan/admin/login` and sign in with `YAN_ADMIN_PASSWORD`.
2. From `/yan/admin`, pick a content type.
3. **+ New** opens a form matching that model's fields; **Edit** opens the same
   form pre-filled; **Delete** removes a row (with a confirm prompt).
4. Boolean columns marked in the table (e.g. `featured`, `verified`) are
   click-to-toggle inline — no need to open the edit form for a quick publish/feature flip.
5. Every model has a `status` field (`pending` / `published` / `archived`, or
   similar) — **content only appears on the public site once status is
   `published`**. All public submissions (group suggestions, leader nominations,
   story/resource submissions, prayer requests) are created as `pending`/`new` and
   never auto-publish.

Session lasts 12 hours (HMAC-signed cookie, no database-backed session table).

## 6. Form routing & internal notifications

All public forms follow the existing repo pattern (Zod validate → honeypot check →
rate limit → `prisma.create()` → best-effort notification email, each independently
try/caught). Every notification email goes to **`info@lwnetwork.org`** (the
existing `NOTIFY_EMAIL`/fallback address) per your decision — no new YAN-specific
inbox was introduced.

Routes: `POST /api/yan/join`, `/api/yan/events/register`, `/api/yan/pray/request`,
`/api/yan/network/suggest`, `/api/yan/resources/submit`, `/api/yan/stories/submit`,
`/api/yan/leaders/nominate`, `/api/yan/subscribe`.

**Prayer requests are handled carefully**: request text is never written to
console logs (only to the internal notification email and the database), and
every submission defaults to `private`/unpublished until moderated.

## 7. Required environment variables

No secret values are included here — only names and purpose.

| Variable | Required for | Notes |
|---|---|---|
| `YAN_ADMIN_PASSWORD` | `/yan/admin` login | Single shared password. Not yet set in this environment — admin login returns a clear 503 until it is. |
| `YAN_ADMIN_SESSION_SECRET` | Admin session signing | Optional — falls back to `YAN_ADMIN_PASSWORD` if unset. Recommended to set separately in production. |

Everything else (`DATABASE_URL`, `RESEND_API_KEY`, `NOTIFY_EMAIL`, MS Graph vars)
reuses the site's existing configuration — nothing new required there.

## 8. Atlanta image source/license manifest

8 images sourced from Unsplash and Pexels (Downtown/Midtown skyline, BeltLine,
murals/street texture, diverse young-adult community scenes, historic Atlanta
architecture). Full manifest with original URLs, photographers, licenses, and
per-image usage notes: **`public/images/yan/source/MANIFEST.md`**. Both licenses
used (Unsplash License, Pexels License) permit free commercial use without
attribution; attribution is recorded anyway as good practice. The two
"young adults gathering" photos are generic stock and are flagged in the manifest
as **not** to be captioned as an actual YAN event.

**Update:** the official logo files were supplied mid-build and are now in use —
`public/images/yan/brand/{yan-logo-primary,yan-logo-reverse,yan-icon-mark}.png`.
`YanLogoHorizontal` renders the official lockup PNG directly (primary for light
backgrounds, reverse for dark). No official stacked/vertical lockup was supplied,
so the footer's stacked mark composes the official icon geometry
(`src/components/yan/brand/YanMark.tsx`, rebuilt to match the real triangle/node
mark exactly) with wordmark text — swap in a real stacked asset here if one is
produced later.

## 9. SEO & analytics implementation

- Unique `metadata` (title/description/OG/canonical) on every `/yan/*` route via `src/lib/seo.ts`'s existing `canonical()`/`breadcrumbJsonLd()` helpers.
- `Organization` JSON-LD on `/yan` (with `parentOrganization` → Living Water Network) and `Event` JSON-LD on event detail pages **only when a real `startsAt` date exists** — no invented dates.
- All 8 `/yan/*` routes added to `src/app/sitemap.ts`; `/yan/admin` explicitly disallowed in `robots.ts`; nothing else under `/yan` is `noindex`d.
- Analytics: `src/lib/yanAnalytics.ts` defines the ~14 named events from the spec (`yan_gateway_opened`, `yan_join_completed`, etc.) and calls are wired at every relevant interaction. Since the site has **no analytics provider configured at all** today, `track()` only console-logs in development — swap its body for a real provider call once one is chosen. No free-text, prayer content, or email addresses are ever passed as event properties.

## 10. Accessibility & reduced-motion summary

- Skip link, landmark structure, and heading hierarchy on every route.
- `MovementGateway` and both navbars (`YanNavbar` mobile menu) are full accessible dialogs/menus: focus moves in on open, Tab is trapped, Escape closes and returns focus to the trigger.
- All motion (Framer Motion `FadeInSection`/`StaggerChildren`, plus the new `yan-animate-signal`/`yan-animate-node-drift` CSS keyframes) is gated by `prefers-reduced-motion` — the existing app-wide `MotionConfig reducedMotion="user"` covers every Framer Motion use automatically, and the new CSS keyframes are explicitly disabled in a `@media (prefers-reduced-motion: reduce)` block.
- Every form has associated `<label>`s, inline `role="alert"` errors, and a visible focus ring (reusing the site's existing focus-ring convention).
- No signature WebGL/canvas hero was added — the "cinematic Atlanta" effect comes from photography + gradient + typography, which keeps 100% of content and actions available with JavaScript, motion, and hover all disabled.

## 11. Performance & testing results

**Automated (run in this session):**
```bash
npm install            # installs vitest + @playwright/test (newly added)
npm run build           # ✓ succeeds — see note below on required env vars
npm test                # ✓ 15/15 unit tests pass (Zod schema validation)
```
`npm run build` requires `RESEND_API_KEY` to be a non-empty string (a pre-existing
repo requirement, unrelated to this YAN work — `lib/email.ts` constructs a `Resend`
client at module scope) and a syntactically valid `DATABASE_URL` for `prisma
generate`. Real values are configured in Vercel already; this session verified the
build succeeds using placeholder values for both.

**Manual smoke test (this session):** started `npm run dev` against an
unreachable database and requested all 9 public `/yan/*` routes — all returned
HTTP 200 and rendered their designed empty/coming-soon states (confirms
`safeYanQuery` works before `db:push` is run). Screenshotted `/yan`, `/yan/network`,
`/yan/events`, `/yan/pray`, `/yan/join`, and `/programs` at 390px and 1440px —
no horizontal overflow, no layout breaks. One visual bug was found and fixed
during this pass: several section backgrounds used a translucent `bg-yan-stone/40-50`
that rendered muddy over the mini-site's navy body — changed to solid `bg-yan-stone`.

**Pre-existing issue observed, not a YAN regression:** `/favicon.ico` returns a
500 on every page (including `/programs`, untouched by this work) — there appear
to be two conflicting favicon sources (`public/favicon.ico` and
`src/app/favicon.ico`) already in the repo. Worth a separate look, unrelated to
this build.

**Not run in this session (needs a live environment):** Playwright e2e
(`npm run test:e2e`, spec written at `tests/e2e/yan.spec.ts` covering the gateway,
join flow, prayer-request crisis language, and keyboard navigation), Lighthouse
audits, and full WCAG automated scanning — all require a deployed/long-running
server this sandboxed session doesn't have. The e2e spec is ready to run in CI or
locally once `npm run dev` is available with a real `DATABASE_URL`.

## 12. Remaining human approvals before launch

1. **Faith foundation copy** (`/yan` page, "What We Hold To" section) — condensed
   from Living Water Network's narrative beliefs (no standalone doctrinal
   statement page exists in the repo to source from directly). Needs sign-off.
2. **YAN logo** — official assets now in use (§8); only the footer's stacked lockup is a composed approximation (no official vertical/stacked asset exists yet).
3. **`YAN_ADMIN_PASSWORD`** — must be set before `/yan/admin` is usable.
4. **`npm run db:push`** — must be run against the real database before any YAN
   content can actually be created/published (site works fine before this, just
   shows empty states).
5. **Analytics provider** — none chosen yet; `track()` is a no-op beyond dev logging.
6. **Fall 2026 Leaders Roundtable** — no date/venue/speakers exist yet by design;
   create the real `YanEvent` row in `/yan/admin/events` (status `coming-soon` →
   `published`) once details are confirmed — no code changes needed.

## 13. Prelaunch checklist

- [ ] Set `YAN_ADMIN_PASSWORD` (and optionally `YAN_ADMIN_SESSION_SECRET`) in Vercel
- [ ] Run `npm run db:push` against production `DATABASE_URL`
- [ ] Approve the condensed faith-foundation copy
- [ ] Produce an official stacked/vertical lockup asset for the footer, if desired (currently a composed approximation)
- [ ] Create the Fall 2026 Leaders Roundtable event row once date/venue are confirmed
- [ ] Invite a handful of real ministries to seed `/yan/network` before public launch
- [ ] Choose and wire an analytics provider into `src/lib/yanAnalytics.ts`
- [ ] Run `npm run test:e2e` against a deployed preview once available
- [ ] Spot-check `/favicon.ico` (pre-existing issue, unrelated to this build)
