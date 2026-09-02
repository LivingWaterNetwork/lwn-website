import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { RelationshipDisclosure } from "@/components/layout/RelationshipDisclosure";
import { contact as copy } from "@/content/copy";
import { CONTACT_DISCLOSURE_LINE, CONTACT_EMAIL } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: copy.body,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  // Optional: a hosted Airtable form for the same Inquiries table. It only
  // renders when a real share link has been supplied — no placeholder URL.
  const airtableFormUrl = process.env.NEXT_PUBLIC_AIRTABLE_FORM_URL;

  return (
    <>
      <PageHeader
        eyebrow={copy.eyebrow}
        headline={copy.headline}
        intro={copy.body}
      />

      <section className="bg-limestone">
        <Container className="py-16 sm:py-20">
          <div className="grid gap-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Reveal>
              <ContactForm contactEmail={CONTACT_EMAIL} />
              {/* Small type, near the form, per 02-WEBSITE-COPY.md. */}
              <p className="mt-8 max-w-prose font-sans text-sm leading-relaxed text-field">
                {CONTACT_DISCLOSURE_LINE}
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="space-y-8 border-t border-forest/10 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                <div>
                  <p className="eyebrow">Email</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="mt-3 inline-block font-display text-lg text-forest underline decoration-brass/60 underline-offset-4 hover:text-brass-dark"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>

                {airtableFormUrl ? (
                  <div>
                    <p className="eyebrow">Prefer a form?</p>
                    <a
                      href={airtableFormUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block font-sans text-base text-forest underline decoration-brass/60 underline-offset-4 hover:text-brass-dark"
                    >
                      Submit the same details through our Airtable form
                    </a>
                  </div>
                ) : null}

                <RelationshipDisclosure />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
