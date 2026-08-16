import type { Metadata } from "next";
import { MissionsContent } from "@/components/sections/MissionsContent";
import { breadcrumbJsonLd } from "@/lib/seo";

// See src/app/programs/counseling/page.tsx for why this is forced dynamic
// (sibling route hit a static-generation build timeout; applied here too
// defensively since this page is structurally identical).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "International Mission Trips",
  description:
    "Inquire about Living Water Network's international mission trips for Christian leaders — broadened perspective, deepened calling, hands-on Kingdom service.",
  openGraph: {
    title: "International Mission Trips | Living Water Network",
    description:
      "International mission trips for Christian leaders — broadened perspective, deepened calling.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "International Mission Trips | Living Water Network",
    description:
      "International mission trips for Christian leaders — broadened perspective, deepened calling.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function MissionsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Programs", path: "/programs" },
              { name: "Mission Trips", path: "/programs/missions" },
            ])
          ),
        }}
      />
      <MissionsContent />
    </>
  );
}
