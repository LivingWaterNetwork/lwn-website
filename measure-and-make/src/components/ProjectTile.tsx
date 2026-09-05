import Link from "next/link";
import type { PublicProject } from "@/content/types";
import { work as copy } from "@/content/copy";

/**
 * A gallery tile for one project. Like ProjectCard, it can only ever receive a
 * Public + Approved record — the props type says so, and `getPublicProjects()`
 * in src/content/projects.ts is the only thing that can produce one.
 *
 * "wide" is the lead tile in the gallery grid; "standard" is everything after
 * it. The variant changes composition and type scale only — never which facts
 * are shown, so no tile can imply more about a project than the registry says.
 */
export type TileVariant = "wide" | "standard";

/** The site's own address, shown as a plate. Never a link here: the whole tile
 *  is already one, and the outbound link lives on the case study. */
function siteLabel(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

export function ProjectTile({
  project,
  variant = "standard",
}: {
  project: PublicProject;
  variant?: TileVariant;
}) {
  const wide = variant === "wide";

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden border border-forest/10 bg-limestone-light transition-colors duration-200 hover:border-brass/60"
    >
      {/* The plate. Carries the live address where the project has one and the
          registry's own status on the right. A project with no public address
          gets no address line rather than a substitute for one — the plate
          stays a single row either way, so tiles in a row stay aligned. */}
      <div className="flex items-center justify-between gap-4 bg-forest px-6 py-3.5 sm:px-8">
        <span className="truncate font-sans text-[11px] font-semibold uppercase tracking-eyebrow text-limestone/85">
          {project.externalUrl ? siteLabel(project.externalUrl) : null}
        </span>
        <span className="shrink-0 font-sans text-[11px] font-semibold uppercase tracking-wide text-brass-light">
          {project.status}
        </span>
      </div>

      <div
        className={`flex flex-1 flex-col p-6 sm:p-8 ${wide ? "lg:p-10" : ""}`}
      >
        <div className={wide ? "lg:grid lg:grid-cols-5 lg:gap-10" : ""}>
          <div className={wide ? "lg:col-span-2" : ""}>
            <p className="eyebrow">{project.organizationOrClient}</p>
            {/* h2, not h3: on /work these tiles are the first headings under
                the page's h1, and its only caller is that gallery. Skipping a
                level (h1 straight to h3) is what someone navigating by heading
                hears as a missing section, and it was a real Lighthouse
                heading-order failure. If this tile is ever reused under a
                section heading, this needs to take its level as a prop. */}
            <h2
              className={`mt-4 font-display leading-snug text-forest ${
                wide ? "text-3xl sm:text-4xl" : "text-2xl"
              }`}
            >
              {project.title}
            </h2>
            <span
              aria-hidden="true"
              className="rule-brass mt-6 block transition-all duration-300 group-hover:w-20"
            />
          </div>

          <div className={wide ? "mt-6 lg:col-span-3 lg:mt-0" : "mt-5"}>
            <p
              className={`font-sans leading-relaxed text-field ${
                wide ? "text-lg" : "text-base"
              }`}
            >
              {project.publicSummary}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-8">
          <ul className="flex flex-wrap gap-2">
            {project.services.map((service) => (
              <li
                key={service}
                className="border border-forest/15 px-2.5 py-1 font-sans text-[11px] font-medium uppercase tracking-wide text-field"
              >
                {service}
              </li>
            ))}
          </ul>
          <span className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-semibold text-forest transition-colors group-hover:text-brass-dark">
            {copy.gallery.tileLink}
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
