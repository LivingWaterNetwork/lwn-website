/**
 * ESIGN/UETA electronic-consent disclosure, versioned so a signer's
 * `consentVersion` always points at the exact text they agreed to. Bump the
 * version string whenever the wording below changes — never edit the text
 * for an existing version in place, for the same reason a published
 * agreement template is immutable.
 */
export const CONSENT_VERSION = "2026-10-20.1";

export const CONSENT_DISCLOSURE_PARAGRAPHS: string[] = [
  "By continuing, you agree to receive and sign this agreement electronically, instead of on paper.",
  "You may request a paper copy of this agreement at no charge, at any time, by emailing info@lwnetwork.org.",
  "You may withdraw your consent to do business electronically at any time by emailing info@lwnetwork.org. Withdrawing consent will not affect the validity of anything you've already signed.",
  "To view, sign, and download this agreement, you'll need a device that can display and open PDF files, and a current web browser.",
];
