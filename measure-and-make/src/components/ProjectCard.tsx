import Link from "next/link";
import type { PublicProject } from "@/content/types";

/**
 * Only ever receives a Public + Approved record — the props type says so, and
 * `getPublicProjects()` in src/content/projects.ts is the only thing that can
 * produce one.
 */
export function ProjectCard({ project }: { project: PublicProject }) {
  return (
    <article className="flex h-full flex-col border border-forest/10 bg-limestone-light p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">{project.organizationOrClient}</p>
        <span className="border border-brass/50 px-2.5 py-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-brass-dark">
          {project.status}
        </span>
      </div>

      {/* The project title is the link, so the card needs no invented
          call-to-action label of its own. */}
      <h3 className="mt-5 font-display text-2xl leading-snug text-forest">
        <Link
          href={`/work/${project.slug}`}
          className="group inline-flex items-baseline gap-2 transition-colors hover:text-brass-dark"
        >
          {project.title}
          <span
            aria-hidden="true"
            className="font-sans text-base text-brass-dark"
          >
            &rarr;
          </span>
        </Link>
      </h3>

      <p className="mt-4 flex-1 font-sans text-base leading-relaxed text-field">
        {project.publicSummary}
      </p>
    </article>
  );
}
