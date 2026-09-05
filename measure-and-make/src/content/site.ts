// Site-wide constants and shared copy. Everything here traces to
// 01-BRAND-FOUNDATION.md or 02-WEBSITE-COPY.md — nothing is invented.

/** Always the full name. Never a two-letter form, anywhere. */
export const BRAND_NAME = "Measure & Make";

export const TITLE_TEMPLATE = `%s — ${BRAND_NAME}`;

export const META_DESCRIPTION =
  "Measure & Make helps mission-driven organizations clarify what matters, design what is needed, and build the digital and operational infrastructure required to move forward responsibly.";

export const POSITIONING_STATEMENT = META_DESCRIPTION;

export const CAPABILITY_LINE = "Strategy. Systems. Digital. Responsible AI.";

/** The venture's own domain. Used for canonical URLs. */
export const SITE_URL = "https://www.measureandmakegroup.com";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  // `accessibleName` exists only where the visible label is a single generic
  // word. "Start" on its own tells someone listing a page's links, or hearing
  // them read out, nothing about where it goes. The visible word is unchanged
  // and the accessible name begins with it, so voice control still matches on
  // what is actually on screen.
  {
    href: "/start",
    label: "Start",
    accessibleName: "Start a conversation",
  },
] as const;

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

export const CTA = {
  primary: { label: "Start a Conversation", href: "/start" },
  secondary: { label: "Explore Our Work", href: "/work" },
} as const;

/**
 * Interim disclosure language, approved as a draft only (01-BRAND-FOUNDATION.md
 * §8, Claims Register row 21). Do not strengthen, soften, or reword either
 * sentence without supporting legal documentation. Single source of truth —
 * the RelationshipDisclosure component reads from here so the wording cannot
 * drift between the footer, the About page, and the Contact page.
 */
export const RELATIONSHIP_DISCLOSURE =
  "Measure & Make is a for-profit venture in development. It is distinct from Living Water Network's charitable programs. Payments for Measure & Make services are not donations and are not tax-deductible.";

export const HOSTING_STATEMENT =
  "Temporarily hosted through the Living Water Network digital ecosystem.";

export const CONTACT_DISCLOSURE_LINE =
  "Measure & Make is a for-profit venture in development, distinct from Living Water Network's charitable programs. Nothing submitted here is a donation.";

export const MICROCOPY = {
  loading: "Just a moment.",
  emptyGeneric: "Nothing here yet — check back soon.",
  requiredField: "This field is required.",
  invalidEmail: "Please enter a valid email address.",
} as const;

/**
 * The only route to Measure & Make is the form at /start. By design the site
 * publishes no email address, telephone number, or postal address: Living Water
 * Network's nonprofit inbox must not receive Measure & Make's commercial
 * inquiries, and no separate Measure & Make address is in service. Anything that
 * needs to point somewhere points here.
 */
export const CONTACT_PATH = "/start";

/** Effective date carried by both legal pages. */
export const LEGAL_EFFECTIVE_DATE = "September 2, 2026";
