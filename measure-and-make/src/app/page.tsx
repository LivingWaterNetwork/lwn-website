import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CtaLink } from "@/components/ui/CtaLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitText } from "@/components/ui/SplitText";
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

      {/* Hero.
          Deliberately NOT wrapped in Reveal. Everything above the fold is
          painted at full strength with no JavaScript involved: no
          IntersectionObserver, no scroll listener, no animation library, and
          nothing that can be left part-way through. The homepage's first
          impression must not depend on an observer firing.

          data-mm-hero marks the block the first-load reveal staggers in as the
          Deep Forest field retracts, in CSS. That rule only matches while
          :root carries data-mm-intro="play" — so on any later page in the
          session, under reduced motion, or with JavaScript off, this block has
          no animation at all and is simply visible. See globals.css. */}
      <section className="mm-grain bg-limestone">
        <Container className="py-16 sm:py-24 lg:py-32">
          <div className="max-w-4xl">
            <div data-mm-hero>
              <Eyebrow>{home.eyebrow}</Eyebrow>
              {/* Composed type: each word rises from behind its own mask as the
                  Deep Forest field retracts. Gated on the reveal actually
                  playing, so a later view in the session, a reduced-motion
                  visitor and a visitor with JavaScript off get the headline at
                  full strength with no animation at all. */}
              <SplitText
                as="h1"
                variant="hero"
                text={home.headline}
                className="mt-6 font-display text-[2.5rem] leading-[1.06] text-forest sm:text-5xl lg:text-[4.25rem]"
              />
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
          </div>
        </Container>
      </section>

      {/* Why Measure & Make */}
      {/* The page's lead section, and the one that breaks the centred column:
          a 5/7 split with the headline held in the narrow measure on the left
          and the body set against it on the right. The brass rule moves to the
          gutter between them and becomes the join rather than an underline. */}
      <section className="mm-grain border-y border-forest/10 bg-limestone-light">
        <Container className="py-16 sm:py-24 lg:py-28">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <SectionHeading
                  eyebrow={home.why.eyebrow}
                  headline={home.why.headline}
                  size="lead"
                  rule={false}
                />
              </div>
              <div className="lg:col-span-7 lg:border-l lg:border-brass/30 lg:pl-16">
                <p className="max-w-prose font-sans text-lg leading-relaxed text-field sm:text-xl">
                  {home.why.body}
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Capabilities overview.
          The heading and its onward link sit on one line at the top of the
          block rather than the link trailing underneath it, so the section
          reads as a labelled index of the four cards below. */}
      <section className="mm-grain bg-limestone">
        <Container className="py-14 sm:py-20 lg:py-24">
          <Reveal>
            <div className="flex flex-col gap-6 border-b border-forest/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow={home.capabilities.eyebrow}
                headline={home.capabilities.headline}
                size="quiet"
                rule={false}
              />
              <Link
                href="/services"
                className="mm-draw inline-flex shrink-0 items-center gap-2 self-start font-sans text-sm font-semibold text-forest transition-colors hover:text-brass-dark sm:self-auto"
              >
                Services
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {capabilities.map((capability, index) => (
              <Reveal key={capability.slugId} delay={index * 0.06}>
                <CapabilityCard capability={capability} index={index} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* How we work.
          The one section that breaks the stack: a full-bleed Deep Forest field
          that rides a few pixels up over the Limestone above it, so the page
          has a seam in it rather than a stack of flush bands. The negative
          margin is matched by padding, so nothing is clipped and the section
          below is unmoved — and it is a top margin on a full-width block, so
          it cannot cause horizontal overflow at any width. */}
      <section className="mm-grain-dark relative -mt-1 bg-forest pt-1">
        <Container className="py-14 sm:py-20 lg:py-28">
          {/* The heading takes seven of twelve columns and the rest is left
              empty, rather than a centred block with even margins. The empty
              five columns are the composition — they are not waiting to be
              filled, and nothing is parked in them. */}
          <Reveal className="lg:w-7/12">
            <SectionHeading
              eyebrow={home.process.eyebrow}
              headline={PROCESS_PRINCIPLE}
              tone="light"
              size="lead"
              rule={false}
            >
              <p>{home.process.intro}</p>
            </SectionHeading>
          </Reveal>
          <ol className="mt-14 grid gap-8 md:grid-cols-2 md:gap-x-16 md:gap-y-10">
            {processStages.map((stage, index) => (
              <Reveal as="li" key={stage.number} delay={index * 0.06}>
                <ProcessStep stage={stage} />
              </Reveal>
            ))}
          </ol>
          <div className="mt-14">
            <CtaLink href="/services" variant="quiet">
              Services
            </CtaLink>
          </div>
        </Container>
      </section>

      {/* Featured work — Public + Approved + featured records only */}
      <section className="mm-grain bg-limestone">
        <Container className="py-14 sm:py-20 lg:py-24">
          <Reveal>
            <SectionHeading
              eyebrow={home.featuredWork.eyebrow}
              headline={home.featuredWork.headline}
              size="quiet"
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
      {/* Closing CTA. The only centred section on the page now, which is what
          makes it read as an ending rather than as the house style. */}
      <section className="mm-grain border-t border-forest/10 bg-limestone-dark">
        <Container className="py-16 text-center sm:py-24 lg:py-28">
          <Reveal>
            <SplitText
              as="h2"
              text={home.closing.headline}
              className="font-display text-3xl leading-tight text-forest sm:text-4xl lg:text-5xl"
            />
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
