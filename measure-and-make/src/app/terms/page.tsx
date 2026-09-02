import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { termsOfService } from "@/content/legal";

// INTERNAL (source only, never rendered): this document is a prelaunch draft.
// Attorney review is required before production launch — see
// docs/LEGAL-REVIEW-HANDOFF.md. The noindex below stays until the owner and
// counsel approve the copy.
export const metadata: Metadata = {
  title: termsOfService.title,
  description: termsOfService.summary,
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return <LegalDocumentPage document={termsOfService} />;
}
