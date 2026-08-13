import type { Metadata } from "next";
import { SponsorTheGalaContent } from "@/components/sections/SponsorTheGalaContent";

// Forced dynamic defensively — a sibling intake page in this same commit
// (src/app/programs/counseling/page.tsx) hit a static-generation build
// timeout on Vercel. See that file's comment for the full explanation.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sponsor the Gala",
  description: "Reserve a table or sponsor Living Water Network's annual Black Tie Gala — Atlanta's Kingdom leadership vision night.",
};

export default function SponsorTheGalaPage() {
  return <SponsorTheGalaContent />;
}
