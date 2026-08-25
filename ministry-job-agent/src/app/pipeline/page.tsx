import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { parseArray } from "@/lib/db/json";
import { laneLabel } from "@/lib/domain/lanes";
import type { RedFlag } from "@/lib/domain/types";
import { Badge, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "PRIORITY", "STRONG", "REVIEW", "PASS", "HOLD"] as const;

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: { c?: string };
}) {
  const filter = (searchParams.c ?? "ALL").toUpperCase();

  const where =
    filter === "ALL"
      ? {}
      : filter === "HOLD"
        ? { OR: [{ onHold: true }, { church: { onHold: true } }] }
        : { classification: filter };

  const opportunities = await prisma.opportunity.findMany({
    where,
    include: { church: true, sources: true, packageRecord: true },
    orderBy: [{ score: "desc" }, { discoveredAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Pipeline"
        subtitle="Every opportunity the system has seen, scored against the approved rubric. Red flags can override a score."
      />

      <nav className="mb-5 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? "/pipeline" : `/pipeline?c=${f}`}
            className={`rounded-md px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset transition-colors ${
              filter === f
                ? "bg-black/[0.06] ring-black/15 dark:bg-white/10 dark:ring-white/20"
                : "ring-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
            }`}
          >
            {f}
          </Link>
        ))}
      </nav>

      {opportunities.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          hint="Drop postings into ./inbox and run `npm run import`, then `npm run score`."
        />
      ) : (
        <div className="space-y-2.5">
          {opportunities.map((o) => {
            const flags = parseArray<RedFlag>(o.redFlagsJson);
            const critical = flags.filter((f) => f.severity === "CRITICAL");
            const major = flags.filter((f) => f.severity === "MAJOR");
            const onHold = o.onHold || o.church.onHold;

            return (
              <Link key={o.id} href={`/opportunities/${o.id}`} className="card block transition-colors hover:border-black/20 dark:hover:border-white/25">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold">{o.title}</span>
                      {o.lane ? <span className="muted text-[12px]">{laneLabel(o.lane)}</span> : null}
                      {onHold ? <Badge tone="danger">HOLD — DO NOT APPLY</Badge> : null}
                    </div>
                    <div className="muted mt-1 text-[13px]">
                      {o.church.name}
                      {o.city || o.state ? ` · ${[o.city, o.state].filter(Boolean).join(", ")}` : ""}
                      {o.sources.length > 1 ? ` · ${o.sources.length} sources` : ""}
                    </div>

                    {critical.length > 0 || major.length > 0 ? (
                      <ul className="mt-2.5 space-y-1">
                        {[...critical, ...major].slice(0, 3).map((f, i) => (
                          <li key={i} className="text-[12px] text-red-700 dark:text-red-400">
                            ⚑ <span className="font-medium">{f.severity}</span> — {f.message}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-2xl font-semibold tabular-nums leading-none">{o.score ?? "—"}</div>
                    <div className="mt-1.5">
                      <Badge tone={o.classification ?? "PASS"}>{o.classification ?? "UNSCORED"}</Badge>
                    </div>
                    <div className="muted mt-1.5 text-[11px]">{o.status.replace(/_/g, " ")}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
