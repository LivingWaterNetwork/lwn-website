// Site-wide constants and shared copy. Everything here traces to
// 01-BRAND-FOUNDATION.md or 02-WEBSITE-COPY.md — nothing is invented.

/** Always the full name. Never a two-letter form, anywhere. */
export const BRAND_NAME = "Measure & Make";

export const TITLE_TEMPLATE = `%s — ${BRAND_NAME}`;

export const META_DESCRIPTION =
  "Measure & Make helps mission-driven organizations clarify what matters, design what is needed, and build the digital and operational infrastructure required to move forward responsibly.";

export const POSITIONING_STATEMENT = META_DESCRIPTION;

export const CAPABILITY_LINE = "Strategy. Systems. Digital. Responsible AI.";

/**
 * Temporary host path while the venture shares Living Water Network
 * infrastructure (01-BRAND-FOUNDATION.md §8). Used for canonical URLs.
 */
export const SITE_URL = "https://www.lwnetwork.org/measure-and-make";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

export const CTA = {
  primary: { label: "Start a Conversation", href: "/contact" },
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
 * Contact details are deliberately absent. No email, phone, or address has been
 * supplied (Claims Register row 20 / Open Decisions #3), and inventing a
 * plausible one would be a fabricated claim. Anything that needs to display
 * contact details should render this pending note instead.
 */
export const CONTACT_DETAILS_PENDING =
  "A direct contact address for Measure & Make has not been set yet. This will be published here once it is.";
