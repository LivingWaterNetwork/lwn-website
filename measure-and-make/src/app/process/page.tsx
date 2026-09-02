import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CtaLink } from "@/components/ui/CtaLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { processPage as copy } from "@/content/copy";
import { PROCESS_CLOSING_LINE, processStages } from "@/content/process";
import { CTA } from "@/content/site";

export const metadata: Metadata = {
  title: "Process",
  description: processStages[0].body,
  alternates: { canonical: "/process" },
};

export default function ProcessPage() {
  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} headline={copy.headline} />

      <section className="bg-limestone">
        <Container className="py-16 sm:py-20">
          <ol className="space-y-14">
            {processStages.map((stage) => (
              <Reveal key={stage.number}>
                <li className="grid gap-8 border-t border-forest/10 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                  <div className="flex items-baseline gap-4">
                    <span
                      aria-hidden="true"
                      className="font-display text-3xl leading-none text-brass"
                    >
                      {stage.number}
                    </span>
                    <h2 className="font-display text-2xl leading-snug text-forest">
                      {stage.name}
                    </h2>
                  </div>
                  <p className="max-w-prose font-sans text-lg leading-relaxed text-field">
                    {stage.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-forest">
        <Container className="py-16 text-center sm:py-20">
          <Reveal>
            <p className="font-display text-2xl text-limestone sm:text-3xl">
              {PROCESS_CLOSING_LINE}
            </p>
            <div className="mt-10 flex justify-center">
              <CtaLink href={CTA.primary.href} variant="quiet">
                {CTA.primary.label}
              </CtaLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
