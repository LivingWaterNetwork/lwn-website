import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { RelationshipDisclosure } from "@/components/layout/RelationshipDisclosure";
import { contact as copy } from "@/content/copy";
import { processStages } from "@/content/process";
import { CONTACT_DISCLOSURE_LINE } from "@/content/site";

export const metadata: Metadata = {
  title: "Start a Conversation",
  description: copy.body,
  alternates: { canonical: "/start" },
};

export default function StartPage() {
  return (
    <>
      <PageHeader
        eyebrow={copy.eyebrow}
        headline={copy.headline}
        intro={copy.body}
      />

      <section className="bg-limestone">
        <Container className="py-14 sm:py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
            <Reveal>
              <ContactForm />
              {/* Small type, near the form, per 02-WEBSITE-COPY.md. */}
              <p className="mt-8 max-w-prose font-sans text-sm leading-relaxed text-field">
                {CONTACT_DISCLOSURE_LINE}
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <aside className="space-y-8 border-t border-forest/10 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                <div>
                  <h2 className="eyebrow">What happens next</h2>
                  <ol className="mt-4 space-y-4">
                    <li className="font-sans text-base leading-relaxed text-field">
                      We read what you sent and reply to arrange a conversation.
                    </li>
                    <li className="font-sans text-base leading-relaxed text-field">
                      That conversation is stage one of our process,{" "}
                      {processStages[0].name}. Nothing gets designed or quoted
                      before it.
                    </li>
                    <li className="font-sans text-base leading-relaxed text-field">
                      If the work is a fit, scope and terms are set out in a
                      written agreement.
                    </li>
                  </ol>
                </div>

                <div className="border-t border-forest/10 pt-8">
                  <h2 className="eyebrow">Privacy</h2>
                  <p className="mt-4 max-w-prose font-sans text-base leading-relaxed text-field">
                    What you send is used to answer your inquiry and is stored
                    in our inquiry records. Our{" "}
                    <Link
                      href="/privacy"
                      className="underline decoration-brass/60 underline-offset-4 hover:text-brass-dark"
                    >
                      Privacy Policy
                    </Link>{" "}
                    explains what we keep and how to ask us to correct or delete
                    it.
                  </p>
                </div>

                <div className="border-t border-forest/10 pt-8">
                  <RelationshipDisclosure />
                </div>
              </aside>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
