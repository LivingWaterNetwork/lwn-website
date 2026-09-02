import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PendingNote } from "@/components/ui/PendingNote";
import { Reveal } from "@/components/ui/Reveal";
import { legalPlaceholder } from "@/content/copy";
import { CONTACT_EMAIL } from "@/content/site";

/**
 * Both legal pages are placeholders and must not launch as final copy — counsel
 * review is a hard launch blocker, not a nice-to-have (08-OPEN-DECISIONS.md #6),
 * which is why the pending marker is visible rather than a comment in the source.
 */
export function LegalPlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader eyebrow="LEGAL" headline={title} />

      <section className="bg-limestone">
        <Container className="py-16 sm:py-20">
          <Reveal className="max-w-3xl space-y-8">
            <p className="max-w-prose font-sans text-lg leading-relaxed text-field">
              {legalPlaceholder.body}
            </p>
            <p className="font-sans text-base text-forest">
              <Link
                href="/contact"
                className="underline decoration-brass/60 underline-offset-4 hover:text-brass-dark"
              >
                Start a conversation
              </Link>
              <span className="text-field"> or email </span>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline decoration-brass/60 underline-offset-4 hover:text-brass-dark"
              >
                {CONTACT_EMAIL}
              </a>
              <span className="text-field">.</span>
            </p>
            <PendingNote>
              {`This ${title} is placeholder text, not final legal copy. It needs counsel review before the site launches, and the contact form collects personal information in the meantime.`}
            </PendingNote>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
