import type { Metadata } from "next";
import { LegalPlaceholderPage } from "@/components/LegalPlaceholderPage";
import { legalPlaceholder } from "@/content/copy";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: legalPlaceholder.body,
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return <LegalPlaceholderPage title="Terms of Service" />;
}
