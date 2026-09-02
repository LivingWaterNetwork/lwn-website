import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { CatalystProjectMeta } from "@/lib/catalystTypes";
import { CatalystStatusBadge } from "./CatalystStatusBadge";
import { CatalystProjectCard } from "./CatalystProjectCard";

interface Props {
  project: CatalystProjectMeta;
  related: CatalystProjectMeta[];
  /** Optional long-form MDX body rendered after the structured sections. */
  children?: ReactNode;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pt-8 cat-rule">
      <h2 className="cat-eyebrow">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * One template for every project page. Sections whose data is missing are
 * omitted entirely rather than rendered empty, so a lightly-documented project
 * still reads as complete.
 */
export function CatalystProjectDetail({ project, related, children }: Props) {
  const isInternalLink = project.externalUrl.startsWith("/");

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden="true" className="absolute inset-0 cat-grid-bg opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 font-sans text-sm text-white/50">
              <li>
                <Link href="/catalyst" className="hover:text-white transition-colors">
                  Catalyst
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/catalyst/work" className="hover:text-white transition-colors">
                  Work
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white/80">{project.title}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <CatalystStatusBadge status={project.status} />
            {project.year && (
              <span className="font-sans text-sm text-white/60 tabular-nums">{project.year}</span>
            )}
          </div>

          <h1 className="cat-h1 text-white mt-5 max-w-4xl">{project.title}</h1>

          {project.summary && (
            <p className="cat-lede text-white/75 mt-7 max-w-3xl">{project.summary}</p>
          )}
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Sidebar meta */}
            <aside className="lg:col-span-4 lg:order-2">
              <div className="cat-panel lg:sticky lg:top-24">
                <h2 className="cat-eyebrow">Project details</h2>
                <dl className="mt-5 space-y-5">
                  {project.client && (
                    <div>
                      <dt className="cat-meta-term">Client</dt>
                      <dd className="cat-meta-value">{project.client}</dd>
                    </div>
                  )}
                  {project.organization && project.organization !== project.client && (
                    <div>
                      <dt className="cat-meta-term">Organization</dt>
                      <dd className="cat-meta-value">{project.organization}</dd>
                    </div>
                  )}
                  {project.projectType && (
                    <div>
                      <dt className="cat-meta-term">Project type</dt>
                      <dd className="cat-meta-value">{project.projectType}</dd>
                    </div>
                  )}
                  {project.services.length > 0 && (
                    <div>
                      <dt className="cat-meta-term">Services</dt>
                      <dd className="cat-meta-value">
                        <ul className="space-y-1.5">
                          {project.services.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                  {project.year && (
                    <div>
                      <dt className="cat-meta-term">Year</dt>
                      <dd className="cat-meta-value tabular-nums">{project.year}</dd>
                    </div>
                  )}
                </dl>

                {project.externalUrl && (
                  <div className="mt-7 pt-6 cat-rule">
                    {isInternalLink ? (
                      <Link href={project.externalUrl} className="btn-secondary w-full">
                        Visit the site
                      </Link>
                    ) : (
                      <a
                        href={project.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary w-full"
                      >
                        Visit the site
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* Main narrative */}
            <div className="lg:col-span-8 lg:order-1 space-y-10">
              {project.challenge && (
                <Section title="The challenge">
                  <p className="cat-body whitespace-pre-line">{project.challenge}</p>
                </Section>
              )}

              {project.approach && (
                <Section title="Our approach">
                  <p className="cat-body whitespace-pre-line">{project.approach}</p>
                </Section>
              )}

              {project.workCompleted.length > 0 && (
                <Section title="Work completed">
                  <ul className="space-y-2.5">
                    {project.workCompleted.map((item) => (
                      <li key={item} className="cat-body flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-[0.65em] h-px w-3 bg-[#0A77BC] shrink-0"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {project.currentStage && (
                <Section title="Current stage">
                  <p className="cat-body">{project.currentStage}</p>
                </Section>
              )}

              {project.images.length > 0 && (
                <Section title="Screenshots">
                  <div className="grid sm:grid-cols-2 gap-5">
                    {project.images.map((image) => (
                      <figure
                        key={image.src}
                        className="overflow-hidden rounded-lg border border-navy/10 bg-mist"
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          width={1200}
                          height={800}
                          className="h-auto w-full object-cover"
                        />
                      </figure>
                    ))}
                  </div>
                </Section>
              )}

              {project.outcomes.length > 0 && (
                <Section title="Outcomes">
                  <ul className="space-y-2.5">
                    {project.outcomes.map((item) => (
                      <li key={item} className="cat-body flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-[0.65em] h-px w-3 bg-copper shrink-0"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {project.nextPhase && (
                <Section title="Next phase">
                  <p className="cat-body">{project.nextPhase}</p>
                </Section>
              )}

              {children && (
                <section className="pt-8 cat-rule">
                  <div className="prose prose-lg prose-headings:font-serif prose-headings:text-navy prose-a:text-[#0A77BC] prose-blockquote:border-copper prose-blockquote:text-slate max-w-none">
                    {children}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-mist">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <h2 className="cat-h2 text-navy">More work</h2>
            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item) => (
                <CatalystProjectCard key={item.slug} project={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden="true" className="absolute inset-0 cat-grid-bg opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h2 className="cat-h2 text-white">Your vision deserves infrastructure.</h2>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalyst/start" className="btn-copper">
              Start a Conversation
            </Link>
            <Link
              href="/catalyst/work"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-white/30 text-white font-semibold font-sans text-sm tracking-wide transition hover:bg-white/10 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spring focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              All work
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
