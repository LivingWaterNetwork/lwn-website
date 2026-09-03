import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CtaLink } from "@/components/ui/CtaLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BrandIntro } from "@/components/BrandIntro";
import { CapabilityCard } from "@/components/CapabilityCard";
import { ProcessStep } from "@/components/ProcessStep";
import { ProjectCard } from "@/components/ProjectCard";
import { OrganizationSchema } from "@/components/OrganizationSchema";
import { capabilities } from "@/content/capabilities";
import { home, work } from "@/content/copy";
import { PROCESS_PRINCIPLE, processStages } from "@/content/process";
import { getFeaturedProjects } from "@/content/projects";
import { CAPABILITY_LINE, CTA, META_DESCRIPTION } from "@/content/site";

export const metadata: Metadata = {
  description: META_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const featured = getFeaturedProjects();

  return (
    <>
      <OrganizationSchema />

      {/* The first-load brand reveal, homepage only, once per session. It is a
          visual overlay over the page below, which renders and works exactly
          the same with the overlay gone. */}
      <BrandIntro />

      {/* Hero */}
      <section className="bg-limestone">
        <Container className="py-16 sm:py-24 lg:py-32">
          <Reveal className="max-w-4xl">
            {/* data-mm-hero marks the block the reveal staggers in as the
                Deep Forest field retracts. With no reveal playing — any later
                page in the session, or reduced motion — it does nothing. */}
            <div data-mm-hero>
              <Eyebrow>{home.eyebrow}</Eyebrow>
              <h1 className="mt-6 font-display text-4xl leading-[1.1] text-forest sm:text-5xl lg:text-6xl">
                {home.headline}
              </h1>
              <p className="mt-8 max-w-prose font-sans text-lg leading-relaxed text-field sm:text-xl">
                {home.supporting}
              </p>
              <p className="mt-8 font-display text-lg text-brass-dark">
                {CAPABILITY_LINE}
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <CtaLink href={CTA.secondary.href}>
                  {CTA.secondary.label}
                </CtaLink>
                <CtaLink href={CTA.primary.href} variant="secondary">
                  {CTA.primary.label}
                </CtaLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Why Measure & Make */}
      <section className="border-y border-forest/10 bg-limestone-light">
        <Container className="py-14 sm:py-20 lg:py-24">
          <Reveal>
            <SectionHeading
              eyebrow={home.why.eyebrow}
              headline={home.why.headline}
            >
              <p>{home.why.body}</p>
            </SectionHeading>
          </Reveal>
        </Container>
      </section>

      {/* Capabilities overview */}
      <section className="bg-limestone">
        <Container className="py-14 sm:py-20 lg:py-24">
          <Reveal>
            <SectionHeading
              eyebrow={home.capabilities.eyebrow}
              headline={home.capabilities.headline}
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {capabilities.map((capability, index) => (
              <Reveal key={capability.slugId} delay={index * 0.06}>
                <CapabilityCard capability={capability} index={index} />
              </Reveal>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-forest transition-colors hover:text-brass-dark"
            >
              Services
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* How we work */}
      <section className="bg-forest">
        <Container className="py-14 sm:py-20 lg:py-24">
          <Reveal>
            <SectionHeading
              eyebrow={home.process.eyebrow}
              headline={PROCESS_PRINCIPLE}
              tone="light"
            >
              <p>{home.process.intro}</p>
            </SectionHeading>
          </Reveal>
          <ol className="mt-12 grid gap-8 md:grid-cols-2 md:gap-10">
            {processStages.map((stage, index) => (
              <Reveal key={stage.number} delay={index * 0.06}>
                <ProcessStep stage={stage} />
              </Reveal>
            ))}
          </ol>
          <div className="mt-12">
            <CtaLink href="/services" variant="quiet">
              Services
            </CtaLink>
          </div>
        </Container>
      </section>

      {/* Featured work — Public + Approved + featured records only */}
      <section className="bg-limestone">
        <Container className="py-14 sm:py-20 lg:py-24">
          <Reveal>
            <SectionHeading
              eyebrow={home.featuredWork.eyebrow}
              headline={home.featuredWork.headline}
            />
          </Reveal>

          {featured.length > 0 ? (
            <>
              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {featured.map((project, index) => (
                  <Reveal key={project.slug} delay={index * 0.06}>
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </div>
              <div className="mt-10">
                <CtaLink href={CTA.secondary.href} variant="secondary">
                  {CTA.secondary.label}
                </CtaLink>
              </div>
            </>
          ) : (
            <EmptyState className="mt-12" message={work.emptyState} />
          )}
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-forest/10 bg-limestone-dark">
        <Container className="py-14 text-center sm:py-20 lg:py-24">
          <Reveal>
            <h2 className="font-display text-3xl leading-tight text-forest sm:text-4xl">
              {home.closing.headline}
            </h2>
            <p className="mx-auto mt-6 max-w-prose font-sans text-lg leading-relaxed text-field">
              {home.closing.body}
            </p>
            <div className="mt-10 flex justify-center">
              <CtaLink href={CTA.primary.href}>{CTA.primary.label}</CtaLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
