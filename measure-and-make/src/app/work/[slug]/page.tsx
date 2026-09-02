import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { CtaLink } from "@/components/ui/CtaLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { work as copy } from "@/content/copy";
import {
  getProjectBySlug,
  getPublicProjectSlugs,
} from "@/content/projects";
import { CTA } from "@/content/site";

interface Params {
  params: { slug: string };
}

/**
 * Only Public + Approved slugs are enumerated. Any other slug — Draft, Private,
 * or simply nonexistent — falls through to notFound() and renders the ordinary
 * 404, which is what keeps the site from confirming that an unapproved project
 * exists at all.
 */
export function generateStaticParams() {
  return getPublicProjectSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: Params): Metadata {
  const project = getProjectBySlug(params.slug);
  if (!project) return { title: "Not found" };

  return {
    title: project.title,
    description: project.publicSummary,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

function Block({ label, children }: { label: string; children: string }) {
  return (
    <div className="border-t border-forest/10 pt-8">
      <h2 className="eyebrow">{label}</h2>
      <p className="mt-4 max-w-prose font-sans text-lg leading-relaxed text-field">
        {children}
      </p>
    </div>
  );
}

export default function ProjectDetailPage({ params }: Params) {
  const project = getProjectBySlug(params.slug);
  if (!project) notFound();

  return (
    <>
      <section className="border-b border-forest/10 bg-limestone-light">
        <Container className="py-16 sm:py-20">
          <Reveal className="max-w-3xl">
            <Eyebrow>{project.organizationOrClient}</Eyebrow>
            <h1 className="mt-5 font-display text-4xl leading-tight text-forest sm:text-5xl">
              {project.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="border border-brass/50 px-2.5 py-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-brass-dark">
                {project.status}
              </span>
              <span className="font-sans text-sm text-field">
                {project.projectType}
              </span>
            </div>
            <p className="mt-8 max-w-prose font-sans text-xl leading-relaxed text-forest/85">
              {project.publicSummary}
            </p>
            {project.externalUrl ? (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 font-sans text-sm font-semibold text-forest underline decoration-brass/60 underline-offset-4 hover:text-brass-dark"
              >
                {project.externalUrl.replace(/^https:\/\//, "")}
                <span aria-hidden="true">&rarr;</span>
              </a>
            ) : null}
          </Reveal>
        </Container>
      </section>

      <section className="bg-limestone">
        <Container className="py-16 sm:py-20">
          <div className="max-w-3xl space-y-12">
            <Reveal>
              <Block label={copy.detailLabels.challenge}>
                {project.challenge}
              </Block>
            </Reveal>
            <Reveal>
              <Block label={copy.detailLabels.approach}>{project.approach}</Block>
            </Reveal>
            <Reveal>
              <Block label={copy.detailLabels.workCompleted}>
                {project.workCompleted}
              </Block>
            </Reveal>
            <Reveal>
              <Block label={copy.detailLabels.currentStage}>
                {project.currentStage}
              </Block>
            </Reveal>

            {/* Rendered only when verified outcomes actually exist. An empty
                array renders nothing at all — never a placeholder metric. */}
            {project.verifiedOutcomes.length > 0 ? (
              <Reveal>
                <div className="border-t border-forest/10 pt-8">
                  <h2 className="eyebrow">
                    {copy.detailLabels.verifiedOutcomes}
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {project.verifiedOutcomes.map((outcome) => (
                      <li
                        key={outcome}
                        className="flex gap-4 font-sans text-lg leading-relaxed text-field"
                      >
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-brass" />
                        <span className="max-w-prose">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}
          </div>
        </Container>
      </section>

      <section className="border-t border-forest/10 bg-limestone-dark">
        <Container className="py-16 text-center sm:py-20">
          <Reveal>
            <div className="flex flex-wrap justify-center gap-4">
              <CtaLink href={CTA.primary.href}>{CTA.primary.label}</CtaLink>
              <CtaLink href={CTA.secondary.href} variant="secondary">
                {CTA.secondary.label}
              </CtaLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
