import type { Metadata } from "next";
import { CatalystLandingContent } from "@/components/catalyst/CatalystLandingContent";
import { getFeaturedProjects } from "@/lib/catalyst";
import { breadcrumbJsonLd } from "@/lib/seo";

// Reads the file-based project content on each request, so publishing a project
// (flipping `visibility` to `public`) takes effect without a rebuild — and so a
// project pulled back to draft disappears immediately. Same reasoning as /blog.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/catalyst" },
  title: "Living Water Catalyst — Strategy, Systems, Technology, Growth",
  description:
    "Living Water Catalyst helps mission-driven organizations turn vision into strategy, digital experiences, working systems, and infrastructure. An innovation and growth initiative being developed within the Living Water Network ecosystem.",
  openGraph: {
    title: "Living Water Catalyst | Living Water Network",
    description:
      "Strategy, systems, technology, and responsible AI—designed around the organization, not the other way around.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Living Water Catalyst | Living Water Network",
    description:
      "Strategy, systems, technology, and responsible AI—designed around the organization, not the other way around.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function CatalystPage() {
  const projects = getFeaturedProjects(3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Catalyst", path: "/catalyst" }])),
        }}
      />
      <CatalystLandingContent projects={projects} />
    </>
  );
}
