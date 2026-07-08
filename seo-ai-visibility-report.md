# SEO / AI-Search-Visibility Audit & Improvement Report
**Living Water Network (lwnetwork.org)** — prepared 2026-07-06

---

## 1. What I found (state before changes)

### Technical SEO
- **No `sitemap.xml`** — no `app/sitemap.ts` existed anywhere in the codebase.
- **No `robots.txt`** — no `app/robots.ts` existed anywhere.
- Root layout (`src/app/layout.tsx`) had a solid title template (`"%s | Living Water Network"`), a sensible default description, and `metadataBase` correctly pointed at `https://lwnetwork.org` via `NEXT_PUBLIC_SITE_URL`.
- **Home page (`src/app/page.tsx`) had no `metadata` export at all** — the single most important page for brand and category search was silently inheriting the generic site-wide description instead of something specific to "Christian leadership development / discipleship mentorship."
- **Duplicate title-suffix bug**: the `cohort`, `faq`, `privacy`, and `terms` pages each hardcoded `"... | Living Water Network"` in their own `title`, which then had the layout's `%s | Living Water Network` template applied on top — producing doubled suffixes in the real `<title>` tag (e.g., "Groundwork | Living Water Network | Living Water Network").
- **No page anywhere set per-page Open Graph or Twitter Card metadata** — every shared link (iMessage, Slack, Facebook, LinkedIn, X) for every page showed the same generic site name and logo image regardless of which page was shared, and no Twitter card `card` type was declared at all.
- `src/app/events/page.tsx` is a client component (`"use client"`), so it structurally cannot export `metadata` — it's stuck on generic site-wide defaults even though it's a distinct, indexable Gala landing page. (Not changed — would require a larger refactor to split into server/client components, flagged as a recommendation instead.)
- Blog post metadata (`src/app/blog/[slug]/page.tsx`) had no OG image, no Twitter card, and no fallback description if `excerpt` frontmatter was missing (would silently produce an empty description).

### Structured data (schema.org / JSON-LD)
- **Zero JSON-LD anywhere in the codebase.** Grepping for `application/ld+json`, `schema.org`, `FAQPage`, `Organization` returned no real matches — the only hits were the plain-English phrase "nonprofit organization" in visible body copy, not machine-readable markup.
- This was the single biggest gap for AI-search visibility: Google AI Overviews, ChatGPT, and Perplexity all weight structured data heavily when deciding what to cite, and LWN had none.
- The FAQ page (`src/app/faq/page.tsx`) already had excellent raw material for this — 13 well-written Q&A pairs across 4 categories about the Groundwork program — but none of it was wired into `FAQPage` schema.

### Content / on-page copy
- Per-page copy is generally strong and specific (founder story, program descriptions, Groundwork tracks, theory of change), which is good raw material for both classic SEO and GEO (generative engine optimization) — it just wasn't exposed through metadata or structured data.
- No street address is published anywhere on the site (checked contact, about, footer) and no social media links exist in the Footer component — noted so I didn't fabricate either in structured data.

### Research findings (2026 best practices, via web search)
- **Next.js App Router**: use the file-based `sitemap.ts`/`robots.ts` conventions, set `metadataBase`, use `generateMetadata` for dynamic routes, add JSON-LD for rich results, and rely on Server Components so content is in the HTML from first byte.
- **AI Overviews / GEO**: structured data (Organization, FAQPage, Article schema) is associated with meaningfully higher AI Overview citation rates; pages should expose a direct-answer block near the top, use clear H2/H3 question-style headers, and be checked/updated periodically (recency is a ranking signal for AI citation).
- **Nonprofit/Christian-ministry SEO**: keyword architecture should map to how people actually search — "Christian leadership development," "discipleship-based mentorship," "marketplace ministry Atlanta," "Christian counseling for leaders" — rather than only internal program names like "Groundwork" or "At the Table."

---

## 2. What I changed

All changes are additive, reversible, and scoped to metadata / structured data / sitemap-robots / on-page copy, per the constraints. No visual design, `ProgramInquiryForm`/`detailsBuilder`, or Kit/Stripe/Prisma integration code was touched.

1. **`src/app/sitemap.ts` (new)** — generates `/sitemap.xml` covering all static routes plus every blog post pulled dynamically from `getAllPosts()`, with sensible `priority`/`changeFrequency` values.
2. **`src/app/robots.ts` (new)** — generates `/robots.txt`, allows all crawlers, disallows `/api/`, `/donate/success`, and `/partnership/thank-you`, and points crawlers at the sitemap.
3. **`src/app/layout.tsx`** — added a `NGO`/Organization JSON-LD block (name, description, mission-relevant `knowsAbout` topics, Atlanta/GA address, EIN 93-1859873, nonprofit status, email) rendered site-wide via `<script type="application/ld+json">`. No street address, phone, or social links were invented — only facts already public elsewhere on the site (EIN, city/state, email) were used.
4. **`src/app/faq/page.tsx`** — added `FAQPage` JSON-LD generated directly from the existing 13 Q&A pairs (no new copy invented), plus improved metadata (title, description, OG, Twitter) and fixed the duplicate-suffix bug.
5. **`src/app/blog/[slug]/page.tsx`** — `generateMetadata` now has a not-found fallback, a description fallback if `excerpt` is missing, adds `openGraph` (type `article`, publish date, author) and Twitter card metadata, and the page now emits `BlogPosting` JSON-LD (headline, date, author, publisher) per post.
6. **`src/app/page.tsx` (home)** — added a full `metadata` export with a keyword-relevant title ("Christian Leadership Development & Discipleship-Based Mentorship"), description, and OG/Twitter tags — previously had none.
7. **Duplicate-suffix fix** — `cohort`, `privacy`, and `terms` pages no longer hardcode `"| Living Water Network"` in their titles (letting the layout template apply it once).
8. **Per-page Open Graph + Twitter Card metadata** added to: `about`, `programs`, `programs/counseling`, `programs/mentorship`, `programs/missions`, `programs/speaking`, `cohort`, `theory-of-change`, `blog`, `contact`, `donate`, `partnership`, and `faq`. Titles/descriptions were also lightly rewritten on several pages (About, Programs, Counseling, Mentorship, Speaking, Donate, Partnership) to work in specific search-relevant phrases — "Christian leadership development," "discipleship-based mentorship/counseling," "Atlanta" — without changing the actual page copy or claims.

### Verification
- `npm run build` could not complete in this sandbox: `prisma generate` fails with a `403 Forbidden` fetching engine binaries from `binaries.prisma.sh`, and `next build` separately hangs while `next/font/google` tries to reach `fonts.googleapis.com` — both are outbound-network calls blocked by this sandbox's proxy, confirmed by a direct `curl` to Google Fonts also returning `403` from the proxy. This is a sandbox limitation, not something my changes caused (the font imports and Prisma schema are untouched).
- As a substitute, I ran **`npx tsc --noEmit`** across the whole project — it completed with **zero type errors**, validating that every file I touched (sitemap.ts, robots.ts, layout.tsx, faq/page.tsx, page.tsx, blog/[slug]/page.tsx, and all the per-page metadata edits) is syntactically and structurally sound.
- **Recommendation: Omar should run `npm run build` locally/on Vercel before merging** to get a full network-connected build confirmation — I'm confident in the changes based on the clean type-check, but a real build wasn't possible in this environment.

### Git status
Changes are made directly to the working tree and are **uncommitted**. I did not attempt to commit — per instructions, if `.git` locking is an issue in this sandbox, changes should be committed/pushed from Omar's own terminal. Run `git status` / `git diff` to review before committing.

---

## 3. Prioritized recommendations NOT implemented

**High priority**
1. **Run a real `npm run build` and deploy preview** before merging — confirm the JSON-LD renders correctly and metadata appears in page source on Vercel.
2. **Submit the new sitemap to Google Search Console and Bing Webmaster Tools**, and verify domain ownership if not already done. This is required for the sitemap to actually get crawled — creating it doesn't automatically notify search engines.
3. **Claim/optimize a Google Business Profile** for Living Water Network (Atlanta) — this is one of the highest-leverage local-SEO and AI-Overview-citation moves available, and it's free. Needs a public-facing address or service-area designation.
4. **Add real Person schema for Omar Fandino** (founder bio, credentials, sameAs links to any public professional profiles) on the About page once social/LinkedIn links are finalized — strengthens E-E-A-T signals that both Google and LLM answer engines weight heavily.

**Medium priority**
5. **Build out a content/blog strategy** targeting specific keyword clusters: "what is discipleship-based mentorship," "Christian leadership development program Atlanta," "marketplace ministry," "Christian counseling vs. licensed therapy," etc. Only 3 blog posts currently exist; AI answer engines favor freshly-updated, question-structured content (H2s phrased as questions, direct-answer paragraphs up top).
6. **Add FAQ blocks (with matching FAQPage schema) to the individual program pages** (counseling, mentorship, missions, speaking) — currently only the main FAQ page has this. Program-specific questions ("Is LWN counseling the same as licensed therapy?", "How long is a mentorship relationship?") would capture more specific AI-Overview queries.
7. **Get backlinks from partner churches, Victory Church, and aligned Christian-leadership orgs** — domain authority from relevant, topically-aligned sites remains a strong ranking and citation signal for both classic SEO and GEO.
8. **List LWN in nonprofit directories** — GuideStar/Candid (LWN's own docs already reference this as a roadmap item and the Partnership page links to a GuideStar profile), plus Charity Navigator once financials allow, and general nonprofit/ministry directories.
9. **Add alt text audit** across `/public/images` — many images are used across the site; confirm all have descriptive, keyword-relevant alt text (not verified in this pass since it's scattered across many components).
10. **Refactor `src/app/events/page.tsx`** to split the interactive form into a small client child component so the page itself can become a Server Component and export real `metadata` — currently stuck with generic site-wide title/description.

**Lower priority / longer-term**
11. **Core Web Vitals audit** via PageSpeed Insights / Lighthouse once deployed — not assessable from source code alone.
12. **Add a canonical `sameAs` array** to the Organization JSON-LD once official social media accounts exist (Instagram, LinkedIn, YouTube) — none currently exist in the codebase, so none were fabricated.
13. **Consider adding a `Person` + `Course`/`EducationalOccupationalProgram` schema for the Groundwork cohort** once the program has run at least one cohort and has real outcomes data to cite (avoids fabricating claims before proof points exist).
