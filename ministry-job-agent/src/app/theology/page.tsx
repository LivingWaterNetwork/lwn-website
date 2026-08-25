import { prisma } from "@/lib/db/client";
import { approveTheologyPosition } from "../actions";
import { analyzeCoverage, prioritize, summarizeCoverage, HIGH_PRIORITY_TOPICS } from "@/lib/theology/convergence";
import { REFERENCE_STATEMENTS } from "@/lib/theology/references";
import { Badge, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const LEVEL_TONE: Record<string, string> = {
  CONVERGENT: "PRIORITY",
  SINGLE_SOURCE: "REVIEW",
  DIVERGENT: "danger",
  UNADDRESSED: "neutral",
};

const LEVEL_LABEL: Record<string, string> = {
  CONVERGENT: "sources agree",
  SINGLE_SOURCE: "one source",
  DIVERGENT: "sources conflict",
  UNADDRESSED: "no source",
};

export default async function TheologyPage() {
  const positions = await prisma.theologyPosition.findMany();
  const byTopic = new Map(positions.map((p) => [p.topic, p]));

  const coverage = prioritize(analyzeCoverage());
  const summary = summarizeCoverage(analyzeCoverage());
  const approvedCount = positions.filter((p) => p.status === "APPROVED").length;

  return (
    <>
      <PageHeader
        title="Theology"
        subtitle={`${approvedCount} of ${positions.length} positions defined. Reference statements below are quoted from other organizations — they are not your positions until you make them yours.`}
      />

      <section className="card mb-5">
        <h2 className="mb-1 text-[15px] font-semibold">Your reference statements</h2>
        <p className="muted mb-3 text-[13px] leading-relaxed">
          Pulled verbatim from the churches and ministries you named. Quoted for your reference with attribution;
          nothing here is used to answer an application until you adopt it as your own position.
        </p>
        <ul className="space-y-1.5 text-[13px]">
          {REFERENCE_STATEMENTS.map((r) => (
            <li key={r.key}>
              <a href={r.url} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
                {r.organization}
              </a>{" "}
              <span className="muted">
                · {r.location} · {r.articles.length} articles · fetched {r.fetchedAt}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card mb-5">
        <h2 className="mb-3 text-[15px] font-semibold">Where your sources land</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="label">Agree</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-teal-700 dark:text-teal-300">{summary.convergent}</div>
          </div>
          <div>
            <div className="label">Conflict</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-red-700 dark:text-red-400">{summary.divergent}</div>
          </div>
          <div>
            <div className="label">One source only</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-amber-700 dark:text-amber-400">{summary.singleSource}</div>
          </div>
          <div>
            <div className="label">No coverage</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{summary.unaddressed}</div>
          </div>
        </div>

        {summary.criticalGaps.length > 0 ? (
          <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/[0.06] p-3">
            <div className="text-[13px] font-semibold text-red-700 dark:text-red-400">
              Commonly asked, and none of your sources address it
            </div>
            <p className="muted mt-1 text-[13px] leading-relaxed">
              {summary.criticalGaps.join(" · ")} — these come up in most pastoral searches and you will have to answer
              them in your own words. Until you do, any application asking about them stops.
            </p>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        {coverage.map((c) => {
          const position = byTopic.get(c.topic.topic);
          const isApproved = position?.status === "APPROVED";
          const isHighPriority = HIGH_PRIORITY_TOPICS.includes(c.topic.topic);

          return (
            <details key={c.topic.topic} className="card" open={!isApproved && c.level === "DIVERGENT"}>
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="text-[14px] font-medium">{c.topic.displayName}</span>
                  {isHighPriority ? <span className="muted text-[11px]">commonly asked</span> : null}
                </span>
                <span className="flex items-center gap-1.5">
                  <Badge tone={LEVEL_TONE[c.level]}>{LEVEL_LABEL[c.level]}</Badge>
                  {isApproved ? <Badge tone="PRIORITY">DEFINED</Badge> : <Badge>NOT YET DEFINED</Badge>}
                </span>
              </summary>

              <p className="muted mt-3 text-[13px] leading-relaxed">{c.note}</p>

              {c.conflict ? (
                <div className="mt-3 rounded-md border border-red-500/40 bg-red-500/[0.06] p-3">
                  <div className="text-[12px] font-semibold text-red-700 dark:text-red-400">Where they diverge</div>
                  <p className="mt-1 text-[13px] leading-relaxed">{c.conflict}</p>
                </div>
              ) : null}

              {c.articles.length > 0 ? (
                <div className="mt-4">
                  <div className="label mb-2">Reference text — not yours until you adopt it</div>
                  <div className="space-y-2.5">
                    {c.articles.map((a, i) => (
                      <div key={i} className="hairline rounded-md border p-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[12px] font-semibold">{a.organization}</span>
                          <a href={a.url} target="_blank" rel="noreferrer" className="muted text-[11px] underline underline-offset-2">
                            source
                          </a>
                        </div>
                        <div className="muted mt-0.5 text-[11px]">{a.heading}</div>
                        <p className="mt-1.5 text-[13px] leading-relaxed">{a.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {position?.position ? (
                <div className="mt-4">
                  <div className="label mb-1.5">Your position</div>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{position.position}</p>
                  {position.source ? <p className="muted mt-1 text-[11px]">Source: {position.source}</p> : null}
                </div>
              ) : null}

              <form action={approveTheologyPosition} className="mt-4 space-y-2">
                <input type="hidden" name="topic" value={c.topic.topic} />
                <div className="label">Write it in your own words</div>
                <textarea
                  name="position"
                  rows={5}
                  required
                  defaultValue={position?.position ?? ""}
                  placeholder={
                    c.articles.length > 0
                      ? "Start from the reference text above if it says what you believe — but put it in your own words. A committee can tell the difference, and you will be asked to expand on it."
                      : "No reference covers this. Write your position from scratch."
                  }
                  className="hairline w-full rounded-md border bg-transparent px-3 py-2 text-[13px] leading-relaxed outline-none"
                />
                <input
                  name="shortForm"
                  defaultValue={position?.shortForm ?? ""}
                  placeholder="Short form, for character-limited fields (optional)"
                  className="hairline w-full rounded-md border bg-transparent px-3 py-2 text-[13px] outline-none"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    name="source"
                    defaultValue={position?.source ?? "candidate entry"}
                    className="hairline rounded-md border bg-transparent px-2 py-1.5 text-[12px] outline-none"
                  >
                    <option value="candidate entry">Written from scratch</option>
                    {Array.from(new Set(c.articles.map((a) => a.organization))).map((org) => (
                      <option key={org} value={`adapted from ${org}`}>
                        Adapted from {org}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-[12px]">
                    <input type="checkbox" name="allowAutomaticUse" defaultChecked={position?.allowAutomaticUse} />
                    Allow automatic use on forms
                  </label>
                  <button
                    type="submit"
                    className="rounded-md bg-black px-3 py-1.5 text-[12px] font-medium text-white dark:bg-white dark:text-black"
                  >
                    Approve position
                  </button>
                </div>
              </form>
            </details>
          );
        })}
      </section>
    </>
  );
}
