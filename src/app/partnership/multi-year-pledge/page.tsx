import type { Metadata } from "next";
import { MultiYearPledgeContent } from "@/components/sections/MultiYearPledgeContent";

// Forced dynamic defensively — a sibling intake page in this same commit
// (src/app/programs/counseling/page.tsx) hit a static-generation build
// timeout on Vercel. See that file's comment for the full explanation.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/partnership/multi-year-pledge" },
  title: "Discuss a Multi-Year Pledge",
  description: "Multi-year pledges let Living Water Network plan with confidence — hire staff, build curriculum, and launch new cohorts with certainty.",
};

export default function MultiYearPledgePage() {
  return <MultiYearPledgeContent />;
}
