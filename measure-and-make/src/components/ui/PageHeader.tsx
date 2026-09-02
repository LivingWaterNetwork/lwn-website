import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";

export function PageHeader({
  eyebrow,
  headline,
  intro,
}: {
  eyebrow: string;
  headline: string;
  intro?: string;
}) {
  return (
    <section className="border-b border-forest/10 bg-limestone-light">
      <Container className="py-16 sm:py-20">
        <Reveal className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-5 font-display text-4xl leading-tight text-forest sm:text-5xl">
            {headline}
          </h1>
          <div className="mt-6 rule-brass" />
          {intro ? (
            <p className="mt-6 max-w-prose font-sans text-lg leading-relaxed text-field">
              {intro}
            </p>
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}
