/**
 * Single source of truth for Omar Fandino's digital business card (/connect/omar).
 *
 * Every string, link and contact value the card renders comes from this file, so
 * updating a phone number, an email, or the canonical URL is a one-line change
 * here rather than a hunt through the page and its components. See the README
 * section "Updating the digital business card (/connect/omar)".
 *
 * Content is fixed by the approved handoff package (01-approved-content.md) —
 * do not paraphrase these strings without a corresponding content approval.
 */

/**
 * ⚠️ PLACEHOLDER — NOT YET CONFIRMED LIVE.
 *
 * The QR code encodes this exact string. Before the QR is printed, embedded in
 * an email signature, or distributed in any form, this must be replaced with
 * the real, deployed, stable production URL and the QR regenerated. See the
 * "Deployment checklist" in the README.
 *
 * Overridable via NEXT_PUBLIC_CONNECT_OMAR_URL so a preview deployment can
 * point the QR at itself without editing source.
 */
export const CANONICAL_URL =
  process.env.NEXT_PUBLIC_CONNECT_OMAR_URL ?? "https://www.lwnetwork.org/connect/omar";

/** True while the card is still running against the unconfirmed placeholder. */
export const CANONICAL_URL_IS_PLACEHOLDER =
  !process.env.NEXT_PUBLIC_CONNECT_OMAR_URL;

export const IDENTITY = {
  name: "Omar Fandino",
  identityLine:
    "Founder, Living Water Network | Strategy and Systems, Measure & Make",
  location: "Atlanta, Georgia",
  headshot: "/images/omar-headshot-pro.jpg",
  headshotAlt: "Portrait of Omar Fandino",
} as const;

export const CONTACT = {
  phoneDisplay: "470-475-9123",
  phoneHref: "tel:+14704759123",
  email: "ofandino@lwnetwork.org",
  emailHref: "mailto:ofandino@lwnetwork.org",
  linkedin: "https://www.linkedin.com/in/ofandino/",
} as const;

export const VCARD_FILENAME = "Omar-Fandino.vcf";
export const QR_FILENAME_BASE = "Omar-Fandino-QR";

export const ORGANIZATIONS = [
  {
    key: "lwn",
    name: "Living Water Network",
    descriptor:
      "Equipping Kingdom leaders to disrupt darkness and disciple nations.",
    url: "https://www.lwnetwork.org",
    cta: "Visit Living Water Network",
    ctaAriaLabel: "Visit the Living Water Network website",
    logo: "/images/logo.png",
    logoAlt: "Living Water Network",
    logoWidth: 500,
    logoHeight: 500,
  },
  {
    key: "mm",
    name: "Measure & Make",
    descriptor:
      "Strategy, systems, and responsible AI infrastructure for mission-driven organizations.",
    url: "https://www.measureandmakegroup.com",
    cta: "Visit Measure & Make",
    ctaAriaLabel: "Visit the Measure & Make website",
    // Copied unmodified from the Measure & Make repo's approved package.
    // Dark ink by design — light grounds only, never filtered or inverted.
    // Never abbreviate the name to "M&M", including in alt text.
    logo: "/images/brand/measure-make-03-5-horizontal.svg",
    logoAlt: "Measure & Make",
    logoWidth: 1125,
    logoHeight: 225,
  },
] as const;

export const SHARE = {
  title: "Omar Fandino — Living Water Network & Measure & Make",
  text: "Let's stay connected — here's my contact card.",
  copiedLabel: "Link Copied",
} as const;

export const SOCIAL = {
  title: "Omar Fandino | Living Water Network & Measure & Make",
  description:
    "Founder of Living Water Network and part of Measure & Make. Save my contact, connect on LinkedIn, or reach out directly.",
} as const;

export const QR_COPY = {
  heading: "Scan to Save My Info",
  supporting: "Point your camera at the code, or tap the link below.",
} as const;

export const FOOTER_NOTE =
  "This card shares only what's on it — no tracking, no account required.";

/**
 * The vCard body, exactly as specified in 04-vcard-and-qr-spec.md.
 *
 * Authored here as an array of lines and joined with CRLF at serve time: RFC
 * 6350 requires CRLF, and several iOS/Android importers reject or mangle an
 * LF-only file. Do not reformat this into a template literal — a literal would
 * silently reintroduce LF endings.
 */
export const VCARD_LINES: readonly string[] = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "N:Fandino;Omar;;;",
  "FN:Omar Fandino",
  "TITLE:Founder, Living Water Network | Strategy and Systems, Measure & Make",
  "TEL;TYPE=CELL:+14704759123",
  "EMAIL;TYPE=INTERNET,WORK:ofandino@lwnetwork.org",
  "ADR;TYPE=WORK:;;Atlanta;GA;;;United States",
  "URL:https://www.lwnetwork.org",
  "URL:https://www.measureandmakegroup.com",
  "X-SOCIALPROFILE;TYPE=linkedin:https://www.linkedin.com/in/ofandino/",
  "NOTE:Living Water Network and Measure & Make",
  "END:VCARD",
];

/** The vCard as a single CRLF-delimited string, with a trailing CRLF. */
export function buildVCard(): string {
  return VCARD_LINES.join("\r\n") + "\r\n";
}
