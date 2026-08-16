import type { Metadata } from "next";
import { PartnershipInquireContent } from "@/components/sections/PartnershipInquireContent";

// Forced dynamic defensively — a sibling intake page in this same commit
// (src/app/programs/counseling/page.tsx) hit a static-generation build
// timeout on Vercel. See that file's comment for the full explanation.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/partnership/inquire" },
  title: "Partner With Us — Start the Conversation",
  description: "Tell us about your interest in partnering with Living Water Network at a specific tier or level of investment.",
};

export default function PartnershipInquirePage() {
  return <PartnershipInquireContent />;
}
