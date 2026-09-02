import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CtaLink } from "@/components/ui/CtaLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "@/components/ProjectCard";
import { work as copy } from "@/content/copy";
import { getPublicProjects } from "@/content/projects";
import { CTA } from "@/content/site";

export const metadata: Metadata = {
  title: "Work",
  description: copy.intro,
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const projects = getPublicProjects();

  return (
    <>
      <PageHeader
        eyebrow={copy.eyebrow}
        headline={copy.headline}
        intro={copy.intro}
      />

      <section className="bg-limestone">
        <Container className="py-14 sm:py-16 lg:py-20">
          {projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project, index) => (
                <Reveal key={project.slug} delay={index * 0.06}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState message={copy.emptyState} />
          )}
        </Container>
      </section>

      <section className="border-t border-forest/10 bg-limestone-dark">
        <Container className="py-16 text-center sm:py-20">
          <Reveal>
            <h2 className="font-display text-3xl leading-tight text-forest sm:text-4xl">
              Let&rsquo;s clarify what&rsquo;s next.
            </h2>
            <div className="mt-8 flex justify-center px-6 sm:px-0">
              <CtaLink href={CTA.primary.href}>{CTA.primary.label}</CtaLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
