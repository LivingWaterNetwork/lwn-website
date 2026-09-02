import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { CatalystProjectDetail } from "@/components/catalyst/CatalystProjectDetail";
import { getAllProjects, getProjectBySlug, getRelatedProjects } from "@/lib/catalyst";

// Dynamic for the same reason as the index: publication state is read per
// request, so a project pulled back to draft 404s immediately rather than
// staying served from a build-time render.
export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

// Only published projects get pre-rendered params. `getAllProjects()` already
// filters by visibility, so a draft or private slug is never listed here.
export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProjectBySlug(params.slug);

  // A non-public slug is indistinguishable from a nonexistent one, and is
  // marked noindex so a guessed URL can never be indexed.
  if (!project) {
    return {
      title: "Project Not Found",
      description: "This project could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const { meta } = project;
  const description =
    meta.summary || `${meta.title} — a project by Living Water Catalyst.`;

  return {
    title: meta.title,
    description,
    alternates: { canonical: `/catalyst/work/${meta.slug}` },
    openGraph: {
      title: `${meta.title} | Living Water Catalyst`,
      description,
      type: "article",
      images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.title} | Living Water Catalyst`,
      description,
      images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
    },
  };
}

export default function CatalystProjectPage({ params }: Props) {
  const project = getProjectBySlug(params.slug);
  if (!project) notFound();

  const { meta, content } = project;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lwnetwork.org";

  // Structured data is only ever emitted for a published project, since we've
  // already returned above for anything else.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: meta.title,
    description: meta.summary || undefined,
    dateCreated: meta.year || undefined,
    creator: {
      "@type": "Organization",
      name: "Living Water Catalyst",
    },
    url: `${SITE_URL}/catalyst/work/${meta.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CatalystProjectDetail project={meta} related={getRelatedProjects(meta.slug, 3)}>
        {content.trim() ? <MDXRemote source={content} /> : null}
      </CatalystProjectDetail>
    </>
  );
}
