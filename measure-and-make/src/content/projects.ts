// The project registry, transcribed verbatim from 03-PROJECT-REGISTRY.json in
// the approved content package. This is the ONLY source of project data.
//
// `import "server-only"` is load-bearing: it makes the build fail if this module
// is ever pulled into a client component, which is what keeps Draft and Private
// records out of every client-side JS payload. Filtering happens here, at the
// data layer — never in the UI.
import "server-only";

import type { ProjectRecord, PublicProject } from "./types";

const registry: ProjectRecord[] = [
  {
    title: "Living Water Network Digital Platform",
    slug: "living-water-network-digital-platform",
    organizationOrClient: "Living Water Network",
    projectType: "Nonprofit website & digital platform",
    publicSummary:
      "A full rebuild of Living Water Network's website on a modern stack, replacing a legacy Wix site with a custom Next.js application that supports the organization's programs, donations, and applicant intake end to end.",
    challenge:
      "Living Water Network needed a website capable of processing real donations, real cohort and program applications, and real partnership inquiries — not a brochure site — while staying maintainable by a small team.",
    approach:
      "Migrated from Wix to Next.js (App Router) with TypeScript, Tailwind CSS, and Framer Motion for the front end; Postgres (via Prisma) for data; native Stripe for one-time and recurring donations; Resend and Microsoft Graph for email; Airtable and Kit/ConvertKit for pipeline and newsletter sync.",
    workCompleted:
      "Home, About, Programs, Cohort, Blog, Donate, and Contact pages; native Stripe donation flow (one-time and recurring, preset tiers, automated receipts); database-backed cohort application, contact, and partnership forms with email notification and anti-abuse protections (honeypot fields, per-IP rate limiting); an MDX-based blog; sitemap and structured-data (JSON-LD) coverage on every route; an IndexNow integration for faster indexing on Bing/Yandex-class search engines.",
    currentStage: "Live production site",
    status: "Live",
    services: ["Websites & Digital Platforms", "Operations, AI & Automation"],
    verifiedOutcomes: [
      'Site is live in production and actively processes real donor payments and real program/cohort/partnership inquiries (per the project\'s own README: "real donors process payments through it and real applicants submit program/cohort inquiries").',
    ],
    year: "2025–2026 (build and ongoing iteration; exact start/launch dates not confirmed — see Claims Register)",
    approvedImages: [],
    externalUrl: "https://www.lwnetwork.org",
    visibility: "Public",
    featured: true,
    displayOrder: 1,
    nextPhase:
      "Ongoing content and feature iteration; no specific roadmap item confirmed for public statement.",
    claimsRequiringVerification: [
      "Any specific donor count, dollar amount raised, or number of applicants processed — none of these figures were supplied and none should be published without a verified number.",
      "Exact launch date of the rebuilt site.",
    ],
    publicationApprovalStatus:
      "Approved for factual, non-metric portfolio presentation as described above. Do not add any number (donors, dollars, applicants) without a verified source.",
  },
  {
    title: "Young Adults Network (YAN) Digital Platform",
    slug: "young-adults-network-platform",
    organizationOrClient: "Living Water Network",
    projectType: "Multi-city nonprofit initiative platform",
    publicSummary:
      "A national, multi-city mini-site within the Living Water Network platform connecting young-adult ministries across cities, launched with Atlanta as the founding hub and built to expand honestly, city by city, without redesign.",
    challenge:
      "Living Water Network wanted to connect young-adult ministries across multiple cities under one platform, without a heavy new backend, and without ever presenting an unlaunched city as though it were fully active.",
    approach:
      "Built inside the existing lwn-website Next.js/Tailwind/Framer Motion/Prisma/Postgres/Resend stack — no new backend infrastructure or CMS introduced. A single source-of-truth file governs every city's slug, name, status (live vs. launching-soon), stage badge, tagline, and hero imagery, so a new city can be added honestly labeled (e.g., \"New Hub — Join the Launch Team\") rather than faked. Every route has a real empty state so the platform functions correctly whether a city's data is fully populated or brand new.",
    workCompleted:
      'A YAN-branded shell with a national landing page and a city chooser; Atlanta live as the founding hub, with New York City, Los Angeles, and Phoenix built as additional city hubs; eleven Prisma data models covering Network (ministry/group directory with map view and add-your-group form), Events (listings, detail pages, registration, waitlist, calendar export), Leaders (spotlights with a nomination form), Pray (prayer themes and private-by-default request submission with crisis-line language), Resources (library with submission form), Stories (testimonies requiring explicit consent), Join (a six-pathway application flow), and Newsletter subscription; an admin panel at /yan/admin for content review, with all public submissions created as "pending" pending manual approval; a return path back to lwnetwork.org.',
    currentStage:
      "Live production platform; ongoing city-by-city content growth",
    status: "Live",
    services: [
      "Websites & Digital Platforms",
      "Initiatives & Program Launches",
      "Operations, AI & Automation",
    ],
    verifiedOutcomes: [
      "Live in production at https://www.lwnetwork.org/yan.",
      "Per the project's own build documentation: 15/15 unit tests passing, 15/16 end-to-end tests passing (one intentionally skipped), and Lighthouse scores of 95–100 across Performance, Accessibility, Best Practices, and SEO on all routes.",
    ],
    year: "2026",
    approvedImages: [],
    externalUrl: "https://www.lwnetwork.org/yan",
    visibility: "Public",
    featured: true,
    displayOrder: 2,
    nextPhase:
      "Seeding the network directory with real ministries; approving faith-foundation copy for the national homepage; scheduling and confirming a Fall 2026 Leaders Roundtable event; wiring an analytics provider (currently logging only, no live analytics).",
    claimsRequiringVerification: [
      "Do not state that every city hub is fully operational, every directory is populated, every event is confirmed, or that specific attendance/registration/growth numbers exist — the platform's own documentation is explicit that this is not yet true everywhere.",
      'Do not cite "the youth population of [city]" style statistics used inside the product itself as Measure & Make marketing claims without re-verifying the cited source and date.',
    ],
    publicationApprovalStatus:
      "Approved for factual portfolio presentation, using only the verified facts above and only approved screenshots/assets from the repository — per the founder's direction, treat the existing public site and repository as the factual source and do not add anything beyond what they show.",
  },
  {
    title: "Radiant Events Planning — Website & Brand Build",
    slug: "radiant-events-planning",
    // The business's own site-config.ts uses the shorter "Radiant Events" as its
    // on-site brand name. Radiant Events Planning is the confirmed correct
    // business name per the founder, and is what renders here. The
    // misspelling that tests/no-public-contact-details.test.ts bans must never
    // appear anywhere, including in a comment like this one.
    organizationOrClient: "Radiant Events Planning",
    projectType: "Brand implementation, website design & development",
    publicSummary:
      "A from-scratch brand implementation and production website for an Atlanta-area event planning and design company, covering planning and coordination, room design and styling, and signature installation services.",
    challenge:
      "Radiant Events needed a website that translated an existing brand deck into a real, production-grade site — without inventing portfolio results, testimonials, or pricing the business hadn't yet confirmed.",
    approach:
      "Built on Next.js (App Router), TypeScript, Tailwind CSS, and Framer Motion, implementing the brand's supplied color system (aubergine, cream, tangerine, blush, coral, ink, taupe, stone), its Cormorant Garamond / Montserrat type pairing, and a consistent motion language that respects prefers-reduced-motion. Content is organized as typed local data (services, portfolio, journal) behind typed getter functions, so it can move to a headless CMS later without touching page components.",
    workCompleted:
      "24 routes building successfully with clean lint and no TypeScript errors; full service architecture across three services — Planning + Coordination, Design + Room Styling, and Signature Installations (balloon installations, tablescapes, draping/room styling, custom backdrops) — each with its own outcomes, inclusions, process steps, and FAQ; a client-side-validated contact form (Zod + React Hook Form) with a honeypot field; a documented brand implementation system; and portfolio and about-page structures built and waiting on the business's own photography and copy.",
    currentStage:
      "Feature-complete for its current scope; not yet publicly launched; owner-supplied content and approvals still outstanding",
    status: "In Development",
    services: [
      "Strategy & Organizational Architecture",
      "Websites & Digital Platforms",
    ],
    verifiedOutcomes: [],
    year: "2026",
    approvedImages: [],
    // No outbound link: radianteventsplanning.com currently serves an expired
    // Squarespace page, not this build, and no other address is confirmed.
    externalUrl: null,
    visibility: "Public",
    featured: false,
    displayOrder: 10,
    nextPhase:
      "Owner sign-off on real contact information, portfolio photography, testimonials, pricing disclosure, founder biography, and legal copy (Privacy Policy, Terms of Service) before any public launch or public case-study presentation.",
    claimsRequiringVerification: [
      "All contact details, service boundaries, pricing, geographic service area, imagery, testimonials, and results — none are confirmed for publication per the project's own CONTENT_NEEDED.md file, so none may be added to this record.",
      "The live public address of this site. radianteventsplanning.com serves an expired Squarespace page, not this build; externalUrl stays null until the founder confirms the real address.",
    ],
    publicationApprovalStatus:
      "Approved for public portfolio presentation by the founder on 2026-09-03, limited to the facts already in this record. No imagery, testimonial, pricing, or result may be added, and this record must keep stating that the site is not yet publicly launched for as long as that is true.",
  },
  {
    title: "Organizational Operating System",
    slug: "organizational-operating-system",
    organizationOrClient: "Internal / Living Water Network ecosystem",
    projectType:
      "Internal organizational architecture & knowledge system (strategy stage)",
    publicSummary:
      "An in-development architecture for how a mission-driven organization or family of organizations governs itself, isolates its data and knowledge by organization, and lays responsible-AI and automation foundations under human approval.",
    challenge:
      "Organizations in the Measure & Make orbit need a shared way to think about governance, knowledge continuity, and safe automation that doesn't collapse different organizations' data and decisions into one undifferentiated system.",
    approach:
      "Vision and architecture work only at this stage — no additional source materials (specifications, repositories, or build artifacts) were available beyond the founder's own description of the concept.",
    workCompleted:
      "Approved vision and a neutral-core, organization-isolation architectural concept; no software has been built.",
    currentStage: "Foundation and strategy only",
    status: "Foundation & Strategy",
    services: [
      "Strategy & Organizational Architecture",
      "Operations, AI & Automation",
    ],
    verifiedOutcomes: [],
    year: "2026",
    approvedImages: [],
    externalUrl: null,
    visibility: "Public",
    featured: false,
    displayOrder: 20,
    nextPhase:
      "Define governance model, data/knowledge boundaries, and a concrete build roadmap before describing this as anything beyond a strategy-stage concept.",
    claimsRequiringVerification: [
      "This must never be described as completed or in-progress software — it is a strategy and architecture concept only, per the founder's explicit instruction.",
      "No internal governance documents, theological source materials, security architecture, prompts, schemas, credentials, decision ledgers, or sprint materials may be referenced, quoted, or summarized in any public-facing description.",
    ],
    publicationApprovalStatus:
      "Approved for public presentation only as an approved vision and architecture direction, in the terms above — nothing more specific, until further materials exist and are reviewed. Per the founder's original brief, this project is Public/Foundation & Strategy, and must never be described as built software.",
  },
  // Hand of Life Renovations and Redemption Cleanout Services were both
  // verified against their own live sites on 2026-09-03 (both Next.js
  // applications served from Vercel). Every fact below is either something the
  // live site states about itself or something about the build. Neither
  // record repeats a client's own business claims — years of experience,
  // licensing, response times, testimonials — as a Measure & Make result, and
  // no client telephone number, address, or financial arrangement appears
  // here or anywhere on this site.
  {
    title: "Hand of Life Renovations — Website Design & Build",
    slug: "hand-of-life-renovations",
    organizationOrClient: "Hand of Life Renovations",
    projectType: "Website design & development",
    publicSummary:
      "A production website for an Atlanta-area renovation contractor that sells to two different audiences — homeowners commissioning residential renovations and property owners commissioning multifamily work — from a single site that ends in one structured quote request.",
    challenge:
      "Homeowners and multifamily property partners come to a contractor with different questions and decide on different timelines. The business needed one site that addressed both audiences without burying either, and that turned interest into a structured request rather than an unstructured inquiry.",
    approach:
      "Built as a Next.js application deployed on Vercel, with a distinct path for each audience — residential and multifamily — sharing one visual system, one gallery of completed work, and one quote-request flow reachable from the site's main navigation.",
    workCompleted:
      "Home, Residential, Multifamily, About, Gallery, Contact, and Quote pages, together with a Privacy Policy and Terms of Service; a gallery presenting the company's own project photography; and a structured quote-request path carried in the primary navigation.",
    currentStage: "Live production site",
    status: "Live",
    services: ["Websites & Digital Platforms"],
    verifiedOutcomes: [],
    year: "Build and launch dates not confirmed — see Claims Register.",
    approvedImages: [],
    externalUrl: "https://www.holrenovations.com",
    visibility: "Public",
    featured: false,
    displayOrder: 3,
    nextPhase: "None confirmed for public statement.",
    claimsRequiringVerification: [
      "The claims the client's own site makes about its business — combined years of experience, licensed/bonded/insured status, quote response time, and its customer testimonials — are the client's claims about itself, not Measure & Make outcomes. They must never be repeated here or presented as results of this engagement.",
      "Build start and launch dates, the scope of any ongoing maintenance, and any lead, enquiry, or conversion figure — none supplied, none may be published.",
    ],
    publicationApprovalStatus:
      "Approved for public portfolio presentation by the founder on 2026-09-03, limited to what the live site is and what was built. No metric, testimonial, or client outcome may be added.",
  },
  {
    title: "Redemption Cleanout Services — Brand & Website Build",
    slug: "redemption-cleanout-services",
    organizationOrClient: "Redemption Cleanout Services",
    projectType:
      "Business strategy, brand development, website design & development",
    publicSummary:
      "A brand and production website for a Metro Detroit property cleanout and demolition company, built to make sense of jobs that look nothing alike, to state exactly where the company works county by county, and to start every job from a photo-based estimate.",
    challenge:
      "Cleanout work spans jobs with little in common — an estate, a foreclosure, a hoarding-related clearance, a full structure teardown — and the people hiring for it need two answers before anything else: whether the company works their county, and how a price gets set. The business needed a site that answered both directly, and that stood on its own before it had a volume of public reviews behind it.",
    approach:
      "Built as a Next.js application deployed on Vercel, organized around two service lines and a page for each county in the stated service area, with the estimate process — a photo estimate first, an on-site final — stated plainly on the site instead of left to a phone call.",
    workCompleted:
      "Two service pages, full property cleanouts and demolition; seven county pages covering the company's stated Metro Detroit service area; How It Works, Projects, Reviews, Resources, FAQ, About, and Contact pages; a walkthrough-request path; and an accessibility statement, Privacy Policy, and Terms of Service.",
    currentStage: "Live production site",
    status: "Live",
    services: [
      "Strategy & Organizational Architecture",
      "Websites & Digital Platforms",
    ],
    verifiedOutcomes: [],
    year: "2026",
    approvedImages: [],
    externalUrl: "https://redemptioncleanoutservices.com",
    visibility: "Public",
    featured: false,
    displayOrder: 4,
    nextPhase: "None confirmed for public statement.",
    claimsRequiringVerification: [
      "The claims the client's own site makes about its business — its principal's years in real estate, its service radius, and its quoting turnaround — are the client's claims about itself, not Measure & Make outcomes, and must never be repeated here as results of this engagement.",
      "The client's telephone number, address, principal's name, and financial arrangement must never appear in this record or anywhere on the Measure & Make site.",
      "Build start and launch dates, job volume, and any revenue or lead figure — none supplied, none may be published.",
    ],
    publicationApprovalStatus:
      "Approved for public portfolio presentation by the founder on 2026-09-03, on the founder's confirmation that the client consents to being named in this case study. This record supersedes the earlier Private 'Estate Cleanout & Full-Property Services Website' record for the same engagement; the client's contact details, financial arrangement, and private documents remain excluded from it.",
  },
];

/** The publication gate. Both conditions must hold — see 07-DEVELOPER-CONTENT-MAP.md. */
function isPublishable(project: ProjectRecord): project is PublicProject {
  return (
    project.visibility === "Public" &&
    project.publicationApprovalStatus.startsWith("Approved")
  );
}

export function getPublicProjects(): PublicProject[] {
  return registry
    .filter(isPublishable)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getFeaturedProjects(): PublicProject[] {
  return getPublicProjects().filter((project) => project.featured);
}

/**
 * A Draft or Private slug behaves exactly like a slug that does not exist. The
 * caller is expected to 404 — never to render a "not approved" page, which would
 * itself confirm that the project exists.
 */
export function getProjectBySlug(slug: string): PublicProject | undefined {
  return getPublicProjects().find((project) => project.slug === slug);
}

export function getPublicProjectSlugs(): string[] {
  return getPublicProjects().map((project) => project.slug);
}
