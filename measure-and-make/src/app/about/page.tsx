import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CtaLink } from "@/components/ui/CtaLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PendingNote } from "@/components/ui/PendingNote";
import { Reveal } from "@/components/ui/Reveal";
import { RelationshipDisclosure } from "@/components/layout/RelationshipDisclosure";
import { about as copy } from "@/content/copy";
import { BRAND_NAME, CTA } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: copy.brandMeaningBody,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-forest/10 bg-limestone-light">
        <Container className="py-16 sm:py-20">
          <Reveal className="max-w-3xl">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            {/* The founder-voice headline is not written for them. The page is
                titled with the brand name until that copy is supplied. */}
            <h1 className="mt-5 font-display text-4xl leading-tight text-forest sm:text-5xl">
              About {BRAND_NAME}
            </h1>
            <div className="mt-6 rule-brass" />
            <div className="mt-8">
              <PendingNote>{copy.headlinePending}</PendingNote>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-limestone">
        <Container className="py-16 sm:py-20">
          <div className="max-w-3xl space-y-12">
            <Reveal>
              <p className="max-w-prose font-sans text-lg leading-relaxed text-field">
                {copy.brandMeaningBody}
              </p>
            </Reveal>

            <Reveal>
              <div className="border-t border-forest/10 pt-10">
                <h2 className="eyebrow">Where the company stands</h2>
                <div className="mt-5">
                  <PendingNote>{copy.companyStagePending}</PendingNote>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="border-t border-forest/10 pt-10">
                <h2 className="eyebrow">
                  Relationship to Living Water Network
                </h2>
                {/* Plain language, near the bottom of the page, not hidden. */}
                <div className="mt-5">
                  <RelationshipDisclosure size="body" />
                </div>
              </div>
            </Reveal>
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
