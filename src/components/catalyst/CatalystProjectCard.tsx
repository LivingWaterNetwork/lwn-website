import Link from "next/link";
import type { CatalystProjectMeta } from "@/lib/catalystTypes";
import { CatalystStatusBadge } from "./CatalystStatusBadge";

export function CatalystProjectCard({ project }: { project: CatalystProjectMeta }) {
  return (
    <article className="cat-panel flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3">
        <CatalystStatusBadge status={project.status} />
        {project.year && (
          <span className="font-sans text-xs text-slate/70 tabular-nums">{project.year}</span>
        )}
      </div>

      <h3 className="cat-h3 text-navy mt-4">
        <Link
          href={`/catalyst/work/${project.slug}`}
          className="transition-colors hover:text-[#0A77BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A77BC] focus-visible:ring-offset-2 rounded-sm"
        >
          {project.title}
        </Link>
      </h3>

      {project.projectType && (
        <p className="cat-meta-term mt-2">{project.projectType}</p>
      )}

      {project.summary && (
        <p className="cat-body mt-3 text-[15px] flex-1">{project.summary}</p>
      )}

      {project.services.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5">
          {project.services.map((service) => (
            <li
              key={service}
              className="font-sans text-[11px] uppercase tracking-[0.08em] text-slate/70"
            >
              {service}
            </li>
          ))}
        </ul>
      )}

      {/* The portfolio's job is to send people to the actual work, so a live
          site is reachable straight from the card as well as the detail page. */}
      <div className="mt-6 pt-5 cat-rule flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link
          href={`/catalyst/work/${project.slug}`}
          className="font-sans text-sm font-semibold text-[#0A77BC] transition-colors hover:text-deep-sea focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A77BC] focus-visible:ring-offset-2 rounded-sm"
        >
          View project
          <span aria-hidden="true"> &rarr;</span>
          <span className="sr-only">: {project.title}</span>
        </Link>

        {project.externalUrl &&
          (project.externalUrl.startsWith("/") ? (
            <Link
              href={project.externalUrl}
              className="font-sans text-sm font-medium text-slate transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A77BC] focus-visible:ring-offset-2 rounded-sm"
            >
              Visit site
              <span className="sr-only">: {project.title}</span>
            </Link>
          ) : (
            <a
              href={project.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm font-medium text-slate transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A77BC] focus-visible:ring-offset-2 rounded-sm"
            >
              Visit site
              <span aria-hidden="true"> &#8599;</span>
              <span className="sr-only">: {project.title} (opens in a new tab)</span>
            </a>
          ))}
      </div>
    </article>
  );
}
