import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CtaLink } from "@/components/ui/CtaLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { capabilities } from "@/content/capabilities";
import { capabilitiesPage as copy } from "@/content/copy";
import { CTA } from "@/content/site";

export const metadata: Metadata = {
  title: "Capabilities",
  description: copy.intro,
  alternates: { canonical: "/capabilities" },
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
        <Container className="py-16 sm:py-20">
          <div className="space-y-16">
            {capabilities.map((capability, index) => (
              <Reveal key={capability.slugId}>
                <article
                  id={capability.slugId}
                  className="grid gap-8 border-t border-forest/10 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
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
