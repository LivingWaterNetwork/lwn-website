"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATALYST_STATUS_LABELS,
  type CatalystProjectMeta,
  type CatalystStatus,
} from "@/lib/catalystTypes";
import { CatalystProjectCard } from "./CatalystProjectCard";

interface Props {
  projects: CatalystProjectMeta[];
  types: string[];
  statuses: CatalystStatus[];
}

const ALL = "all";

export function CatalystWorkContent({ projects, types, statuses }: Props) {
  const [type, setType] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) => (type === ALL || p.projectType === type) && (status === ALL || p.status === status)
      ),
    [projects, type, status]
  );

  const isFiltered = type !== ALL || status !== ALL;

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden="true" className="absolute inset-0 cat-grid-bg opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <p className="cat-eyebrow cat-eyebrow-dark">Living Water Catalyst</p>
          <h1 className="cat-h1 text-white mt-5 max-w-2xl">Our work.</h1>
          <p className="cat-lede text-white/75 mt-6 max-w-2xl">
            Projects we&apos;ve built or are building, each labeled with where it actually stands.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          {projects.length === 0 ? (
            <div className="cat-empty">
              <h2 className="cat-h3 text-navy">No published work yet.</h2>
              <p className="cat-body mt-3">
                Projects will appear here as they&apos;re approved for publication.
              </p>
              <Link href="/catalyst/start" className="btn-secondary mt-7">
                Start a Conversation
              </Link>
            </div>
          ) : (
            <>
              {/* Filters. Grouped buttons rather than selects so the current
                  state is visible at a glance and reachable by keyboard. */}
              <div className="space-y-6">
                <fieldset>
                  <legend className="cat-meta-term mb-3">Filter by type</legend>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setType(ALL)}
                      aria-pressed={type === ALL}
                      className={`cat-filter ${type === ALL ? "cat-filter-active" : ""}`}
                    >
                      All types
                    </button>
                    {types.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        aria-pressed={type === t}
                        className={`cat-filter ${type === t ? "cat-filter-active" : ""}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="cat-meta-term mb-3">Filter by status</legend>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus(ALL)}
                      aria-pressed={status === ALL}
                      className={`cat-filter ${status === ALL ? "cat-filter-active" : ""}`}
                    >
                      All statuses
                    </button>
                    {statuses.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        aria-pressed={status === s}
                        className={`cat-filter ${status === s ? "cat-filter-active" : ""}`}
                      >
                        {CATALYST_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="mt-8 flex items-center justify-between gap-4 pt-6 cat-rule">
                <p aria-live="polite" className="font-sans text-sm text-slate">
                  Showing {filtered.length} of {projects.length}{" "}
                  {projects.length === 1 ? "project" : "projects"}
                </p>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={() => {
                      setType(ALL);
                      setStatus(ALL);
                    }}
                    className="font-sans text-sm font-semibold text-[#0A77BC] transition-colors hover:text-deep-sea rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A77BC] focus-visible:ring-offset-2"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {filtered.length > 0 ? (
                <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((project) => (
                    <CatalystProjectCard key={project.slug} project={project} />
                  ))}
                </div>
              ) : (
                <div className="cat-empty mt-10">
                  <h2 className="cat-h3 text-navy">No projects match these filters.</h2>
                  <p className="cat-body mt-3">Try a different combination, or clear the filters.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setType(ALL);
                      setStatus(ALL);
                    }}
                    className="btn-secondary mt-7"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="bg-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h2 className="cat-h2 text-navy">Your vision deserves infrastructure.</h2>
          <div className="mt-8">
            <Link href="/catalyst/start" className="btn-copper">
              Start a Conversation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
