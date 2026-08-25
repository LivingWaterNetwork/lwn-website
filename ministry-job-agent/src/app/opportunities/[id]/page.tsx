import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { parseArray } from "@/lib/db/json";
import { laneLabel } from "@/lib/domain/lanes";
import type { DimensionScore, RedFlag } from "@/lib/domain/types";
import { Badge, PageHeader, ScoreBar, Value } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OpportunityPage({ params }: { params: { id: string } }) {
  const o = await prisma.opportunity.findUnique({
    where: { id: params.id },
    include: {
      church: { include: { facts: true } },
      sources: true,
      packageRecord: { include: { questions: true, approvals: true } },
      humanInputs: { where: { status: "OPEN" } },
      statusHistory: { orderBy: { at: "desc" }, take: 12 },
      followUps: true,
    },
  });

  if (!o) notFound();

  const dimensions = parseArray<DimensionScore>(o.scoreBreakdownJson);
  const flags = parseArray<RedFlag>(o.redFlagsJson);
  const unknowns = parseArray<string>(o.unknownsJson);
  const responsibilities = parseArray<string>(o.responsibilitiesJson);
  const qualifications = parseArray<string>(o.qualificationsJson);
  const benefits = parseArray<string>(o.benefitsJson);
  const portfolio = parseArray<{ name: string; reason: string }>(o.packageRecord?.portfolioItemsJson);
  const onHold = o.onHold || o.church.onHold;

  const verified = o.church.facts.filter((f) => f.kind === "VERIFIED_FACT");
  const inferences = o.church.facts.filter((f) => f.kind === "INFERENCE");

  return (
    <>
      <PageHeader
        title={o.title}
        subtitle={`${o.church.name}${o.city || o.state ? ` · ${[o.city, o.state].filter(Boolean).join(", ")}` : ""}${o.lane ? ` · ${laneLabel(o.lane)}` : ""}`}
        action={
          <div className="shrink-0 text-right">
            <div className="text-3xl font-semibold tabular-nums leading-none">{o.score ?? "—"}</div>
            <div className="mt-2">
              <Badge tone={o.classification ?? "PASS"}>{o.classification ?? "UNSCORED"}</Badge>
            </div>
          </div>
        }
      />

      {onHold ? (
        <div className="card mb-6 border-red-500/40 bg-red-500/[0.06]">
          <div className="text-[13px] font-semibold text-red-700 dark:text-red-400">HOLD — DO NOT APPLY</div>
          <p className="muted mt-1.5 text-[13px]">{o.church.holdReason ?? o.holdReason ?? "On hold by the candidate."}</p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <section className="card">
            <h2 className="mb-4 text-[15px] font-semibold">Score breakdown</h2>
            {dimensions.length === 0 ? (
              <p className="muted text-[13px]">Not yet scored. Run <code className="font-mono text-[12px]">npm run score</code>.</p>
            ) : (
              <div className="space-y-4">
                {dimensions.map((d) => (
                  <div key={d.key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13px] font-medium">{d.label}</span>
                      <span className="flex items-center gap-2 text-[12px] tabular-nums">
                        {d.confidence === "UNKNOWN" ? <Badge>unknown</Badge> : null}
                        <span className="font-medium">{d.awarded}/{d.max}</span>
                      </span>
                    </div>
                    <div className="mt-1.5"><ScoreBar awarded={d.awarded} max={d.max} /></div>
                    <ul className="muted mt-2 space-y-0.5 text-[12px] leading-relaxed">
                      {d.rationale.map((r, i) => <li key={i}>· {r}</li>)}
                      {d.unknowns.map((u, i) => <li key={`u${i}`} className="text-amber-700 dark:text-amber-400">? {u}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          {flags.length > 0 ? (
            <section className="card border-red-500/30">
              <h2 className="mb-3 text-[15px] font-semibold">Red flags</h2>
              <div className="space-y-3">
                {flags.map((f, i) => (
                  <div key={i}>
                    <div className="text-[13px] font-medium">
                      <Badge tone={f.severity === "MINOR" ? "neutral" : "danger"}>{f.severity}</Badge>{" "}
                      {f.message}
                    </div>
                    <div className="muted mt-1 text-[12px] leading-relaxed">Evidence: {f.evidence}</div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="card">
            <h2 className="mb-3 text-[15px] font-semibold">Church research</h2>
            {o.church.researchStatus !== "RESEARCHED" ? (
              <p className="muted text-[13px]">This church has not been researched. Culture and theology scores are held at baseline.</p>
            ) : null}

            <div className="mt-2 space-y-4">
              <div>
                <div className="label mb-1.5">Verified facts</div>
                {verified.length === 0 ? (
                  <p className="muted text-[13px]">None recorded.</p>
                ) : (
                  <ul className="space-y-1 text-[13px] leading-relaxed">
                    {verified.map((f) => (
                      <li key={f.id}>
                        · {f.claim}{" "}
                        {f.sourceUrl ? (
                          <a href={f.sourceUrl} className="muted underline underline-offset-2" target="_blank" rel="noreferrer">
                            source
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="label mb-1.5 text-amber-700 dark:text-amber-400">Inference / potential concern</div>
                {inferences.length === 0 ? (
                  <p className="muted text-[13px]">None recorded.</p>
                ) : (
                  <ul className="space-y-1 text-[13px] leading-relaxed">
                    {inferences.map((f) => <li key={f.id}>· {f.claim}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="mb-3 text-[15px] font-semibold">The role</h2>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed"><Value>{o.descriptionText}</Value></p>

            {responsibilities.length > 0 ? (
              <div className="mt-4">
                <div className="label mb-1.5">Responsibilities</div>
                <ul className="space-y-0.5 text-[13px] leading-relaxed">
                  {responsibilities.map((r, i) => <li key={i}>· {r}</li>)}
                </ul>
              </div>
            ) : null}

            {qualifications.length > 0 ? (
              <div className="mt-4">
                <div className="label mb-1.5">Qualifications</div>
                <ul className="space-y-0.5 text-[13px] leading-relaxed">
                  {qualifications.map((q, i) => <li key={i}>· {q}</li>)}
                </ul>
              </div>
            ) : null}
          </section>

          {unknowns.length > 0 ? (
            <section className="card">
              <h2 className="mb-3 text-[15px] font-semibold">Unknown information</h2>
              <ul className="space-y-1 text-[13px] leading-relaxed">
                {unknowns.map((u, i) => <li key={i}>? {u}</li>)}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="card">
            <div className="label mb-2">Compensation</div>
            <div className="text-[13px]">
              {o.salaryMin || o.salaryMax ? (
                <>
                  ${(o.salaryMin ?? o.salaryMax)!.toLocaleString()}
                  {o.salaryMin && o.salaryMax ? ` – $${o.salaryMax.toLocaleString()}` : ""}
                </>
              ) : (
                <span className="muted italic">NOT PROVIDED — not disclosed</span>
              )}
            </div>
            {benefits.length > 0 ? <div className="muted mt-1.5 text-[12px]">{benefits.join(", ")}</div> : null}
          </section>

          <section className="card">
            <div className="label mb-2">Sources</div>
            <ul className="space-y-1.5 text-[12px]">
              {o.sources.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                    {s.source}
                  </a>
                  {s.isCanonical ? <span className="muted"> · canonical</span> : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <div className="label mb-2">Application package</div>
            {o.packageRecord ? (
              <div className="space-y-2 text-[13px]">
                <div>
                  Status: <span className="font-medium">{o.packageRecord.status.replace(/_/g, " ")}</span>
                </div>
                <div className="muted text-[12px]">Resume: {o.packageRecord.resumeVariant ?? "not selected"}</div>
                <div className="muted text-[12px]">Angle: {o.packageRecord.coverLetterAngle ?? "—"}</div>
                {portfolio.length > 0 ? (
                  <div className="muted text-[12px]">Portfolio: {portfolio.map((p) => p.name).join(", ")}</div>
                ) : null}
                <Link href={`/approve/${o.packageRecord.id}`} className="mt-1 block font-medium underline underline-offset-4">
                  Open approval screen
                </Link>
              </div>
            ) : (
              <p className="muted text-[13px]">
                No package prepared. Run{" "}
                <code className="font-mono text-[12px]">npm run report -- --prepare --id={o.id}</code>
              </p>
            )}
          </section>

          {o.humanInputs.length > 0 ? (
            <section className="card border-amber-500/40">
              <div className="label mb-2 text-amber-700 dark:text-amber-400">Human input required</div>
              <ul className="space-y-1.5 text-[12px] leading-relaxed">
                {o.humanInputs.map((h) => <li key={h.id}>· [{h.kind}] {h.question}</li>)}
              </ul>
              <Link href="/queue" className="mt-2 block text-[12px] font-medium underline underline-offset-4">
                Go to the queue
              </Link>
            </section>
          ) : null}

          <section className="card">
            <div className="label mb-2">History</div>
            <ul className="space-y-1.5 text-[12px]">
              {o.statusHistory.map((e) => (
                <li key={e.id}>
                  <span className="muted">{e.at.toISOString().slice(0, 10)}</span> {e.toStatus.replace(/_/g, " ")}
                  {e.note ? <div className="muted leading-relaxed">{e.note}</div> : null}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
