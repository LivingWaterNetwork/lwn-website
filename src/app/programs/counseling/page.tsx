import type { Metadata } from "next";
import { CounselingContent } from "@/components/sections/CounselingContent";

// Force dynamic rendering — this route was hitting Next's 60s static
// generation timeout on Vercel's build machine (3/3 attempts failed,
// blocking the whole deployment). The page has no expensive data
// fetching, so this is a build-time worker/concurrency issue, not a
// content issue. Rendering per-request costs nothing meaningful for a
// low-traffic intake form page and fully removes it from the static
// export step. See CLAUDE_HANDOFF.txt Section 7 for details.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Christian Counseling for Leaders",
  description:
    "Discipleship-based counseling for Christian leaders — spiritual, emotional, and relational care that helps you lead from wholeness, not depletion.",
  openGraph: {
    title: "Christian Counseling for Leaders | Living Water Network",
    description:
      "Discipleship-based, pastoral counseling for Christian leaders — spiritual, emotional, and relational care.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Christian Counseling for Leaders | Living Water Network",
    description:
      "Discipleship-based, pastoral counseling for Christian leaders — spiritual, emotional, and relational care.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function CounselingPage() {
  return <CounselingContent />;
}
