import { Container } from "@/components/ui/Container";
import { CtaLink } from "@/components/ui/CtaLink";
import { notFound as copy } from "@/content/copy";

export default function NotFound() {
  return (
    <section className="bg-limestone">
      <Container className="py-24 sm:py-32">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl leading-tight text-forest sm:text-5xl">
            {copy.headline}
          </h1>
          <div className="mt-6 rule-brass" />
          <p className="mt-6 max-w-prose font-sans text-lg leading-relaxed text-field">
            {copy.body}
          </p>
          <div className="mt-10">
            <CtaLink href="/">{copy.cta}</CtaLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
