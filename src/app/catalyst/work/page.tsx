import type { Metadata } from "next";
import { CatalystWorkContent } from "@/components/catalyst/CatalystWorkContent";
import { getAllProjects, getProjectStatuses, getProjectTypes } from "@/lib/catalyst";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/catalyst/work" },
  title: "Our Work",
  description:
    "Projects built by Living Water Catalyst — websites, digital platforms, initiative launches, and organizational architecture, each labeled with its current status.",
  openGraph: {
    title: "Our Work | Living Water Catalyst",
    description:
      "Websites, digital platforms, initiative launches, and organizational architecture — each labeled with its current status.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Work | Living Water Catalyst",
    description:
      "Websites, digital platforms, initiative launches, and organizational architecture — each labeled with its current status.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function CatalystWorkPage() {
  // All three reads go through the same server-side visibility filter in
  // src/lib/catalyst.ts, so draft/private projects never reach the client
  // bundle — not even as filter options.
  const projects = getAllProjects();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Catalyst", path: "/catalyst" },
              { name: "Work", path: "/catalyst/work" },
            ])
          ),
        }}
      />
      <CatalystWorkContent
        projects={projects}
        types={getProjectTypes()}
        statuses={getProjectStatuses()}
      />
    </>
  );
}
