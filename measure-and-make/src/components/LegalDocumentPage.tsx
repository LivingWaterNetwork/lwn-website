import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import type { LegalDocument } from "@/content/legal";
import { CONTACT_PATH } from "@/content/site";

/**
 * Renders a legal document. The contact route is the form at /start — this site
 * publishes no email address, so every "reach us" instruction points there.
 */
export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  return (
    <>
      <PageHeader
        eyebrow={document.eyebrow}
        headline={document.title}
        intro={document.summary}
      />

      <section className="bg-limestone">
        <Container className="py-14 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <Reveal>
              <p className="font-sans text-sm font-semibold uppercase tracking-eyebrow text-field">
                Effective {document.effectiveDate}
              </p>
            </Reveal>

            {/* A short jump list: these documents are long on a phone. */}
            <Reveal>
              <nav aria-label="On this page" className="mt-10">
                <ol className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  {document.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="font-sans text-sm leading-relaxed text-field underline decoration-brass/40 underline-offset-4 hover:text-forest"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </Reveal>

            <div className="mt-14 space-y-12">
              {document.sections.map((section) => (
                <Reveal key={section.id}>
                  <article
                    id={section.id}
                    className="scroll-mt-24 border-t border-forest/10 pt-8"
                  >
                    <h2 className="font-display text-xl leading-snug text-forest sm:text-2xl">
                      {section.heading}
                    </h2>

                    {section.paragraphs?.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 40)}
                        className="mt-5 max-w-prose font-sans text-base leading-relaxed text-field"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {section.list ? (
                      <ul className="mt-5 space-y-3">
                        {section.list.map((item) => (
                          <li
                            key={item.slice(0, 40)}
                            className="flex gap-4 font-sans text-base leading-relaxed text-field"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-brass"
                            />
                            <span className="max-w-prose">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <p className="mt-14 border-t border-forest/10 pt-8 font-sans text-base leading-relaxed text-field">
                To reach us about anything on this page,{" "}
                <Link
                  href={CONTACT_PATH}
                  className="text-forest underline decoration-brass/60 underline-offset-4 hover:text-brass-dark"
                >
                  start a conversation
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
