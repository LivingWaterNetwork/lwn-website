import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CtaLink } from "@/components/ui/CtaLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { capabilities } from "@/content/capabilities";
import {
  PROCESS_CLOSING_LINE,
  PROCESS_PRINCIPLE,
  processStages,
} from "@/content/process";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { capabilitiesPage as copy } from "@/content/copy";
import { CTA } from "@/content/site";

export const metadata: Metadata = {
  title: "Capabilities",
  description: copy.intro,
  alternates: { canonical: "/services" },
};

export default function CapabilitiesPage() {
  return (
    <>
      <PageHeader
        eyebrow={copy.eyebrow}
        headline={copy.headline}
        intro={copy.intro}
      />

      <section className="bg-limestone">
        <Container className="py-14 sm:py-16 lg:py-20">
          <div className="space-y-12 sm:space-y-16">
            {capabilities.map((capability, index) => (
              <Reveal key={capability.slugId}>
                <article
                  id={capability.slugId}
                  className="grid gap-6 border-t border-forest/10 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10 md:pt-10"
                >
                  <div>
                    <p className="font-display text-sm text-brass-dark">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-4 font-display text-2xl leading-snug text-forest">
                      {capability.name}
                    </h2>
                    <p className="mt-4 font-display text-lg text-brass-dark">
                      {capability.tagline}
                    </p>
                  </div>
                  <p className="max-w-prose font-sans text-lg leading-relaxed text-field">
                    {capability.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* The four-stage process lives here, alongside the capabilities it
          runs through, so the two are read together. */}
      <section className="bg-forest">
        <Container className="py-16 sm:py-20 lg:py-24">
          <Reveal>
            <SectionHeading
              eyebrow="HOW WE WORK"
              headline={PROCESS_PRINCIPLE}
              tone="light"
            >
              <p>
                Every engagement moves through the same four stages, in order:
              </p>
            </SectionHeading>
          </Reveal>

          <ol className="mt-12 space-y-10">
            {processStages.map((stage) => (
              <Reveal key={stage.number}>
                <li className="grid gap-6 border-t border-limestone/20 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
                  <div className="flex items-baseline gap-4">
                    <span
                      aria-hidden="true"
                      className="font-display text-3xl leading-none text-brass"
                    >
                      {stage.number}
                    </span>
                    <h3 className="font-display text-xl text-limestone sm:text-2xl">
                      {stage.name}
                    </h3>
                  </div>
                  <p className="max-w-prose font-sans text-base leading-relaxed text-sage sm:text-lg">
                    {stage.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal>
            <p className="mt-14 font-display text-xl text-limestone sm:text-2xl">
              {PROCESS_CLOSING_LINE}
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-forest/10 bg-limestone-dark">
        <Container className="py-14 text-center sm:py-16 lg:py-20">
          <Reveal>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
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
