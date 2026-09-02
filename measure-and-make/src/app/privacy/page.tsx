import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { privacyPolicy } from "@/content/legal";

// INTERNAL (source only, never rendered): this document is a prelaunch draft,
// written from an audit of what this repository actually does. Attorney review
// is required before production launch — see docs/LEGAL-REVIEW-HANDOFF.md. The
// noindex below stays until the owner and counsel approve the copy.
export const metadata: Metadata = {
  title: privacyPolicy.title,
  description: privacyPolicy.summary,
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return <LegalDocumentPage document={privacyPolicy} />;
}
