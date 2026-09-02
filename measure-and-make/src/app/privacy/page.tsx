import type { Metadata } from "next";
import { LegalPlaceholderPage } from "@/components/LegalPlaceholderPage";
import { legalPlaceholder } from "@/content/copy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: legalPlaceholder.body,
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return <LegalPlaceholderPage title="Privacy Policy" />;
}
