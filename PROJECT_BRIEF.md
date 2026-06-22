# Living Water Network — Website Rebuild
### Project Brief for Claude Code

---

## 1. Overview

Rebuild the Living Water Network website (currently on Wix at lwnetwork.org) as a full
custom site with native donation processing and an expanded page set. Living Water
Network is a 501(c)(3) nonprofit focused on spiritual formation, discipleship, and
leadership development for Kingdom leaders in both ministry and the marketplace.

**Current site:** https://www.lwnetwork.org (Wix — Home + Support the Movement pages only)

---

## 2. Tech Stack

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Database:** Postgres via Neon or Supabase (leads, donations, blog posts, cohort applications)
- **Payments:** Stripe (Checkout or Payment Element) — one-time + recurring (monthly/yearly) donations
- **Email:** Resend (or similar) for donation receipts + form notifications
- **CMS for blog:** MDX files in-repo to start (can migrate to DB-driven later if needed)

---

## 3. Brand Direction

### Color Palette (confirmed)
- **Primary (deep teal/blue):** `#0F4C5C` — "living water," depth, trust
- **Accent (warm gold):** `#D4A24C` — Kingdom/royal warmth
- **Neutral background:** off-white / stone (`#F7F5F0` or similar)
- **Neutral text:** charcoal (`#222222` or similar)

### Typography
`[PLACEHOLDER — no preference specified yet; recommend a clean serif for headings
(e.g. "Lora" or "Playfair Display") paired with a readable sans-serif for body text
(e.g. "Inter" or "Source Sans 3")]`

### Logo
`[PLACEHOLDER — need high-res transparent PNG/SVG from Omar. Current site logo is
low-res: https://static.wixstatic.com/media/36b962_3c806392d9a24a8c98842eba77c0d31c~mv2.png]`

---

## 4. Site Structure & Page Content

### Home
- Hero section: tagline **"Equipping Kingdom leaders to disrupt darkness and disciple nations."**
- Mission statement (carry over verbatim, lightly edited for flow):
  > At Living Water Network, our mission is to impact 100,000 Kingdom leaders over the
  > next five years by providing transformative spiritual formation, intentional
  > discipleship, and leadership development for those serving in both ministry and the
  > marketplace. We serve a diverse range of leaders—from emerging pastors to high-level
  > church volunteers, lay leaders, and marketplace influencers—anyone called to lead
  > with purpose and integrity.
  >
  > Through immersive cohorts, personalized counseling, and strategic mentorships, we
  > empower leaders to return to their communities restored, equipped, and inspired to
  > spark meaningful change. In addition to these core programs, we offer dynamic public
  > speaking engagements and international mission trips designed to broaden
  > perspectives and deepen global Kingdom impact.
- Programs overview (brief teaser cards linking to /programs)
- Testimonial/photo section (placeholder images until real photos provided)
- CTA banners: "Join the Network" (links to /cohort application) and "Donate" (links to /donate)

### About
- Founder story — `[PLACEHOLDER: need Omar's bio/founder story content]`
- Org history / why LWN exists
- Philosophy section featuring the Dallas Willard quote —
  `[PLACEHOLDER: need exact quote text — currently only visible as an image on the
  Wix site at https://static.wixstatic.com/media/36b962_101e1d8647874bbba0fdf49a8dca4fc0~mv2.jpg]`
- 501(c)(3) nonprofit status statement

### Programs
Detail blocks for each (expand copy beyond current one-liners once available):
- Immersive Cohorts
- Personalized Counseling
- Strategic Mentorships
- Public Speaking Engagements
- International Mission Trips

### Cohort
- Current/upcoming cohort details — `[PLACEHOLDER: dates, cost, location, application
  criteria — need from Omar]`
- Native application form (replaces current Microsoft Forms link:
  https://forms.office.com/r/vvfXuXFiM7) — submits to DB, sends notification email

### Blog
- Simple list/detail view, MDX-based posts to start
- No existing content to migrate (not present on current site)

### Donate
- Headline: **"Your Generosity Ignites Transformation"**
- Framing: "Join the Circle" — funding the launch of the first cohort
- Native Stripe integration replacing current Wix donation widget
- Preset amount tiers: $50 / $100 / $200 / $500 / $1,000 / $5,000 / $10,000 + custom amount
- Frequency toggle: One-time / Monthly / Yearly
- Optional comment field (100 char limit, matches current site)
- Tax-deductibility disclosure: "Living Water Network Inc. is a 501(c)(3) nonprofit.
  All donations are tax-deductible to the extent allowed by law."
- Auto-generated email receipt on successful donation

### Contact
- Simple contact form (name, email, message) → notification email
- Direct email listed: info@lwnetwork.org

---

## 5. Forms & Backend Requirements

| Form | Current State | New State |
|---|---|---|
| Join the Network | External Microsoft Forms link | Native form → DB + email notification |
| "Learn More" (cohort interest) | External Microsoft Forms link | Folded into /cohort application form |
| Donation | Wix donation widget | Native Stripe integration, recurring + one-time |
| Contact | None visible on current site | New native contact form |

---

## 6. Outstanding Items (need from Omar before final content pass)

1. High-res logo file (PNG/SVG, transparent background)
2. Exact text of the Dallas Willard quote
3. Founder/about bio content
4. Cohort specifics: dates, cost, location, application requirements
5. Stripe account + API keys (Omar to create account; Claude Code wires up integration once keys are provided)
6. Domain registrar access for DNS cutover to Vercel (when ready to go live)
7. Any existing photos/media to use in place of current Wix stock-feeling images
8. Font preference (or approve the recommended pairing above)

None of these block starting the build — all are content swaps into an already-scaffolded site.

---

## 7. Build Order (recommended for Claude Code)

1. Scaffold Next.js + Tailwind project, set up color palette + typography in `tailwind.config`
2. Build shared layout (nav, footer, CTA banner component)
3. Build Home, About, Programs, Cohort, Contact pages with placeholder content where flagged
4. Set up Postgres (Neon/Supabase) schema: `leads`, `donations`, `blog_posts`, `cohort_applications`
5. Build native forms (Cohort application, Contact) wired to DB + email
6. Integrate Stripe for Donate page (test mode until real keys provided)
7. Build Blog (MDX-based listing + post pages)
8. Polish, responsive pass, accessibility pass
9. Deploy to Vercel preview; swap in real content as it arrives; final DNS cutover when ready
