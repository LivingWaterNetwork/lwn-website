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
    year:
      "2025–2026 (build and ongoing iteration; exact start/launch dates not confirmed — see Claims Register)",
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
      'Built inside the existing lwn-website Next.js/Tailwind/Framer Motion/Prisma/Postgres/Resend stack — no new backend infrastructure or CMS introduced. A single source-of-truth file governs every city\'s slug, name, status (live vs. launching-soon), stage badge, tagline, and hero imagery, so a new city can be added honestly labeled (e.g., "New Hub — Join the Launch Team") rather than faked. Every route has a real empty state so the platform functions correctly whether a city\'s data is fully populated or brand new.',
    workCompleted:
      'A YAN-branded shell with a national landing page and a city chooser; Atlanta live as the founding hub, with New York City, Los Angeles, and Phoenix built as additional city hubs; eleven Prisma data models covering Network (ministry/group directory with map view and add-your-group form), Events (listings, detail pages, registration, waitlist, calendar export), Leaders (spotlights with a nomination form), Pray (prayer themes and private-by-default request submission with crisis-line language), Resources (library with submission form), Stories (testimonies requiring explicit consent), Join (a six-pathway application flow), and Newsletter subscription; an admin panel at /yan/admin for content review, with all public submissions created as "pending" pending manual approval; a return path back to lwnetwork.org.',
    currentStage: "Live production platform; ongoing city-by-city content growth",
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
    organizationOrClient:
      'Radiant Events Planning (Atlanta-based event planning and design company; note its own site-config.ts uses the shorter "Radiant Events" as the on-site brand name — Radiant Events Planning is the confirmed correct business name per the founder)',
    projectType: "Brand implementation, website design & development",
    publicSummary:
      "A from-scratch brand implementation and production website for an Atlanta-area event planning and design company, covering planning and coordination, room design and styling, and signature installation services.",
    challenge:
      "Radiant Events needed a website that translated an existing brand deck into a real, production-grade site — without inventing portfolio results, testimonials, or pricing the business hadn't yet confirmed.",
    approach:
      "Built on Next.js (App Router), TypeScript, Tailwind CSS, and Framer Motion, implementing the brand's supplied color system (aubergine, cream, tangerine, blush, coral, ink, taupe, stone), its Cormorant Garamond / Montserrat type pairing, and a consistent motion language that respects prefers-reduced-motion. Content is organized as typed local data (services, portfolio, journal) behind typed getter functions, so it can move to a headless CMS later without touching page components.",
    workCompleted:
      "24 routes building successfully with clean lint and no TypeScript errors; full service architecture across three services — Planning + Coordination, Design + Room Styling, and Signature Installations (balloon installations, tablescapes, draping/room styling, custom backdrops) — each with its own outcomes, inclusions, process steps, and FAQ; a client-side-validated contact form (Zod + React Hook Form) with a honeypot field; a documented brand implementation system; portfolio and about-page scaffolding built and clearly marked as placeholder pending real content.",
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
    externalUrl: null,
    visibility: "Draft",
    featured: false,
    displayOrder: 10,
    nextPhase:
      "Owner sign-off on real contact information, portfolio photography, testimonials, pricing disclosure, founder biography, and legal copy (Privacy Policy, Terms of Service) before any public launch or public case-study presentation.",
    claimsRequiringVerification: [
      "All contact details, service boundaries, pricing, geographic service area, imagery, testimonials, and results — none are confirmed for publication per the project's own CONTENT_NEEDED.md file.",
      "Whether this case study, its wording, its imagery, and the deliverables shown have been explicitly approved by the business owner.",
    ],
    publicationApprovalStatus:
      "Not approved for the public Measure & Make portfolio. Must remain excluded from production pages, metadata, structured data, sitemaps, search, and client-side payloads until the owner explicitly approves the case study, its wording, its imagery, and the deliverables being shown.",
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
      "Approved for public presentation only as an approved vision and architecture direction, in the terms above — nothing more specific, until further materials exist and are reviewed. Per the founder's original brief, this project is Public/Foundation & Strategy (unlike Radiant Events Planning and the Estate Cleanout project, which remain unapproved for publication).",
  },
  {
    title: "Estate Cleanout & Full-Property Services Website",
    slug: "estate-cleanout-services",
    organizationOrClient: "[Withheld — private client]",
    projectType:
      "Business strategy, brand development, and website build (private client)",
    publicSummary: "Withheld pending client approval.",
    challenge: "Withheld.",
    approach: "Withheld.",
    workCompleted: "Withheld from any public record.",
    currentStage:
      "Feature-complete and tested; not deployed; blocked on third-party configuration (lead-capture embed, analytics, review links) and on the client's content approvals — not on code.",
    status: "In Development",
    services: [
      "Strategy & Organizational Architecture",
      "Websites & Digital Platforms",
    ],
    verifiedOutcomes: [],
    year: "2026",
    approvedImages: [],
    externalUrl: null,
    visibility: "Private",
    featured: false,
    displayOrder: 30,
    nextPhase:
      "Not applicable at Private visibility — do not plan public next steps for this record.",
    claimsRequiringVerification: [
      "Client identity, business name, principal's name, address, licensing claims, and financial arrangement must never appear in any Public or Draft record.",
    ],
    publicationApprovalStatus:
      "Not approved for any public or draft presentation. Client identity, financial arrangement, documents, credentials, and private details must not be published under any circumstances without the client's explicit, separate consent.",
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
