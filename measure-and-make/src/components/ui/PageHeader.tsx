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
      <Container className="py-12 sm:py-16 lg:py-20">
        <Reveal className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-5 font-display text-3xl leading-tight text-forest sm:text-4xl lg:text-5xl">
            {headline}
          </h1>
          <div className="mt-6 rule-brass" />
          {intro ? (
            <p className="mt-6 max-w-prose font-sans text-base leading-relaxed text-field sm:text-lg">
              {intro}
            </p>
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}
