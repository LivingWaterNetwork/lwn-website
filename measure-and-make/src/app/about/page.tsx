import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CtaLink } from "@/components/ui/CtaLink";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { RelationshipDisclosure } from "@/components/layout/RelationshipDisclosure";
import { aboutContent } from "@/content/about";
import { CTA } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: aboutContent.lead,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={aboutContent.eyebrow}
        headline={aboutContent.headline}
        intro={aboutContent.lead}
      />

      <section className="bg-limestone">
        <Container className="py-14 sm:py-16 lg:py-20">
          <div className="max-w-3xl space-y-12 sm:space-y-14">
            {aboutContent.sections.map((section) => (
              <Reveal key={section.id}>
                <article className="border-t border-forest/10 pt-8 sm:pt-10">
                  <h2 className="font-display text-2xl leading-snug text-forest sm:text-3xl">
                    {section.heading}
                  </h2>
                  <p className="mt-5 max-w-prose font-sans text-base leading-relaxed text-field sm:text-lg">
                    {section.body}
                  </p>
                </article>
              </Reveal>
            ))}

            <Reveal>
              <article className="border-t border-forest/10 pt-8 sm:pt-10">
                <h2 className="font-display text-2xl leading-snug text-forest sm:text-3xl">
                  {aboutContent.brandMeaningHeading}
                </h2>
                <p className="mt-5 max-w-prose font-sans text-base leading-relaxed text-field sm:text-lg">
                  {aboutContent.brandMeaningBody}
                </p>
              </article>
            </Reveal>

            <Reveal>
              <article className="border-t border-forest/10 pt-8 sm:pt-10">
                <h2 className="font-display text-2xl leading-snug text-forest sm:text-3xl">
                  {aboutContent.relationshipHeading}
                </h2>
                {/* Plain language, near the bottom of the page, not hidden. */}
                <div className="mt-5">
                  <RelationshipDisclosure size="body" includeHostingStatement />
                </div>
              </article>
            </Reveal>
          </div>
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
