# Handoff prompt

Paste everything below the line into a fresh Claude Code session on this
repository. It is written to be self-contained so the new session does not have
to re-read the whole content package or re-derive decisions already made.

---

You are continuing work on the **Measure & Make** marketing website. It is
already built and complete. Do not rebuild it, re-plan it, or re-read the
content package unless a task below requires a specific fact from it.

## Where things stand

- Repository: `LivingWaterNetwork/lwn-website`. Branch: `claude/new-session-ud6aqo`.
  Develop and push there. Do not merge, deploy to production, or change DNS
  without explicit approval.
- The site is a **separate Next.js 14 App Router app** in `measure-and-make/`,
  with its own `package.json`, dependencies, Tailwind config, and build. It
  serves under `basePath: "/measure-and-make"`.
- The Living Water Network app in the repository root is untouched except for one
  line: `tsconfig.json` excludes `measure-and-make`, without which the root
  build type-checks this app and fails on `@/*` resolution. Do not remove it,
  and do not create duplicate components in the root app to "fix" such an error.
- Vercel project `measure-and-make` (`prj_bML03JAmKj6QzQA0AMbqvPIR2y3Y`, team
  `team_ez8l2O8C0yMNIfRsh4LZkaLw`) is linked to this repo with root directory
  `measure-and-make`. Pushing the branch builds a preview. Its production
  branch is `main`, which does not contain this app yet.

## Verify before and after any change

```bash
cd measure-and-make
npm install
npm run verify   # prettier --check, next lint, tsc --noEmit, vitest, next build
npm run build && npx next start -p 4330 &
npm run qa       # browser sweep: console/hydration errors, overflow at 1440/834/390,
                 # keyboard order, focus visibility, mobile menu, reduced motion,
                 # form errors, false-success states, logo decoding
```

All of it passes today: prettier clean, no lint errors, no type errors, 17
tests, production build green, `ALL CHECKS PASSED` from the QA sweep. Leave it
that way. Also confirm the root app still builds if you touch anything outside
`measure-and-make/`.

## Rules that override everything else

1. **The publication gate.** Only records in `src/content/projects.ts` with
   `visibility: "Public"` AND `publicationApprovalStatus` starting with
   "Approved" may reach a route, the sitemap, structured data, an API response,
   or a client-side payload. The filter is at the data layer and the module is
   `server-only`. Public: Living Water Network Digital Platform (Live), Young
   Adults Network (YAN) Digital Platform (Live), Organizational Operating System
   (Foundation & Strategy — never describe it as built software). Withheld:
   Radiant Events Planning (Draft), the estate cleanout business (Private).
   Their slugs must 404, never render a "not approved" page.
2. **No fabricated claims.** No metrics, testimonials, ratings, team size,
   years of experience, client outcomes, launch dates, certifications, or
   awards. Every specific factual claim must trace to a "Yes" row in the Claims
   Register. When in doubt, render nothing.
3. **Never abbreviate "Measure & Make"** — not as M&M or any two-letter form,
   anywhere, including comments, alt text, and metadata. The full name always
   leads; the Maker's Seal is a secondary mark only after the name has appeared.
   Never write "Radeen Events Planning"; the name is Radiant Events Planning.
4. **No public contact details.** No email address, telephone number, or postal
   address anywhere, and never Living Water Network's nonprofit inbox. The form
   at `/measure-and-make/start` is the only contact route. This is deliberate,
   not unfinished. `tests/no-public-contact-details.test.ts` enforces it.
5. **The form never fakes success.** The thank-you renders only on a confirmed
   Airtable write. Every other outcome says what actually happened.
6. **No visible "pending", "coming soon", or placeholder markers** anywhere on
   the site.
7. **Use the supplied brand files as-is.** Never redraw, trace, re-font,
   recolor, filter, invert, or recreate a lockup in CSS or SVG.
8. **Do not touch the Living Water Network app or its `/yan` routes**, its
   database, or its Prisma schema.

## Reference docs already in the repo

- `measure-and-make/README.md` — routes, architecture, launch requirements
- `measure-and-make/docs/CONTACT-FORM-SETUP.md` — the one env var and the
  post-configuration test procedure
- `measure-and-make/docs/LEGAL-REVIEW-HANDOFF.md` — what the legal pages assert
  and what counsel must review
- `measure-and-make/public/brand/INSTALLED-ASSETS.md` — which brand files are
  installed and which are still missing

## Outstanding work, in priority order

1. **Install the missing brand files.** `measure-and-make-03-5-reverse.svg`,
   `measure-make-03-5-stacked.svg`, and the four PNG exports have never reached
   the repository — only the horizontal lockup and the Maker's Seal are
   installed. When the owner attaches the actual files (not screenshots of
   them), copy them unmodified into `measure-and-make/public/brand/`, add a
   `"reverse"` and `"stacked"` variant to `src/components/ui/Logo.tsx`, use the
   reverse lockup on the Deep Forest sections and the footer, and use the
   stacked lockup where a narrow layout needs it. Until then every lockup sits
   on a light ground so the supplied dark-ink artwork renders as drawn — do not
   fake a reverse version with a CSS filter.
2. **Airtable credential.** `AIRTABLE_API_KEY` is not set in any environment.
   Once the owner installs it, run the five-part test procedure in
   `docs/CONTACT-FORM-SETUP.md`. Base `appKznUQ11agoIbcs`, table
   `tblgc13tluLMgJHgo`.
3. **The Airtable notification automation** (`wflq3djrWd5vj2mmL`) is saved as a
   draft and still addressed to Living Water Network's nonprofit inbox. Its
   recipient must change to a Measure & Make address before it is enabled. That
   change is made in the Airtable UI by the owner.
4. **Legal approval.** `/privacy` and `/terms` are complete prelaunch drafts,
   effective September 2, 2026, `noindex`, and excluded from the sitemap. When
   the owner and an attorney approve, remove `robots: { index: false }` from
   both pages and add the two paths to `src/app/sitemap.ts`. Do not remove the
   noindex before then.
5. **Hosting decision, still open.** The site is meant to live at
   `lwnetwork.org/measure-and-make`, but the Living Water Network Vercel project
   builds only the repository root and does not serve these routes. Two options,
   for the owner to choose: (a) deploy this app as its own Vercel project and
   add a rewrite from `/measure-and-make/:path*` in the root app's
   `next.config.mjs` — a small additive change, no LWN route touched; or (b)
   move the app into the root Next app under `src/app/measure-and-make/`, which
   means merging two dependency sets and is the more invasive option. Do not
   pick one without the owner's decision.
6. **Optional, only if asked:** the About page's origin narrative names Radiant
   Events Planning, because the owner's supplied copy does. No case-study
   record, detail page, metadata, or structured data for it exists. Remove the
   name from that sentence only if the owner asks.

Start by telling me which of these you are picking up, then work.
