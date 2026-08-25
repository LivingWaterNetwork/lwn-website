import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { parseArray } from "@/lib/db/json";
import { readinessForApproval, authorizeSubmission } from "@/lib/application/approval-gate";
import { loadPackageForApproval, decideApproval, recordSubmission } from "../../actions";
import { Badge, PageHeader, Value } from "@/components/ui";

export const dynamic = "force-dynamic";

/**
 * The approval screen.
 *
 * It shows exactly what would go to the church — every answer, every attachment,
 * every statement being affirmed — and it refuses to offer the APPROVE button
 * while anything is unresolved. Approving records a decision and freezes a
 * snapshot; it does not submit. Submission stays a separate, manual act.
 */
export default async function ApprovePage({ params }: { params: { id: string } }) {
  const gatePkg = await loadPackageForApproval(params.id);
  if (!gatePkg) notFound();

  const record = await prisma.applicationPackage.findUniqueOrThrow({
    where: { id: params.id },
    include: {
      questions: { orderBy: { createdAt: "asc" } },
      approvals: { orderBy: { decidedAt: "desc" } },
      opportunity: { include: { church: { include: { facts: true } } } },
    },
  });

  const readiness = readinessForApproval(gatePkg);
  const submission = authorizeSubmission(gatePkg);
  const portfolio = parseArray<{ name: string; reason: string }>(record.portfolioItemsJson);
  const attestations = parseArray<string>(record.attestationsJson);
  const opp = record.opportunity;
  const theologyFacts = opp.church.facts.filter((f) => f.category === "theology");
  const latest = record.approvals[0];

  return (
    <>
      <PageHeader
        title="Approve application"
        subtitle={`${opp.church.name} — ${opp.title}. Nothing below has been sent. Approving records your decision; you submit it yourself.`}
        action={
          <div className="shrink-0 text-right">
            <div className="text-3xl font-semibold tabular-nums leading-none">{opp.score ?? "—"}</div>
            <div className="mt-2"><Badge tone={opp.classification ?? "PASS"}>{opp.classification ?? "UNSCORED"}</Badge></div>
          </div>
        }
      />

      {readiness.blockers.length > 0 ? (
        <div className="card mb-6 border-red-500/40 bg-red-500/[0.06]">
          <div className="text-[13px] font-semibold text-red-700 dark:text-red-400">
            Cannot approve — {readiness.blockers.length} blocker{readiness.blockers.length === 1 ? "" : "s"}
          </div>
          <ul className="mt-2 space-y-1 text-[13px] leading-relaxed">
            {readiness.blockers.map((b, i) => <li key={i}>· {b}</li>)}
          </ul>
          <Link href="/queue" className="mt-3 block text-[13px] font-medium underline underline-offset-4">
            Resolve these in the human-input queue
          </Link>
        </div>
      ) : null}

      {readiness.warnings.length > 0 ? (
        <div className="card mb-6 border-amber-500/40 bg-amber-500/[0.06]">
          <div className="text-[13px] font-semibold">Read before approving</div>
          <ul className="mt-2 space-y-1 text-[13px] leading-relaxed">
            {readiness.warnings.map((w, i) => <li key={i}>· {w}</li>)}
          </ul>
        </div>
      ) : null}

      <div className="space-y-5">
        <section className="card">
          <h2 className="mb-3 text-[15px] font-semibold">Summary</h2>
          <dl className="grid gap-x-8 gap-y-3 text-[13px] md:grid-cols-2">
            <div><dt className="label">Church</dt><dd className="mt-0.5">{opp.church.name}</dd></div>
            <div><dt className="label">Role</dt><dd className="mt-0.5">{opp.title}</dd></div>
            <div><dt className="label">Score</dt><dd className="mt-0.5">{opp.score ?? "—"}/100 · {opp.classification}</dd></div>
            <div>
              <dt className="label">Compensation</dt>
              <dd className="mt-0.5">
                {opp.salaryMin || opp.salaryMax ? (
                  <>${(opp.salaryMin ?? opp.salaryMax)!.toLocaleString()}{opp.salaryMin && opp.salaryMax ? ` – $${opp.salaryMax.toLocaleString()}` : ""}</>
                ) : (
                  <span className="muted italic">NOT PROVIDED</span>
                )}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="label">Theology</dt>
              <dd className="mt-0.5">
                {theologyFacts.length ? (
                  <ul className="space-y-0.5">
                    {theologyFacts.map((f) => <li key={f.id}>· {f.claim}</li>)}
                  </ul>
                ) : (
                  <span className="muted italic">Church doctrine not located during research.</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="card">
          <h2 className="mb-3 text-[15px] font-semibold">Attachments</h2>
          <div className="space-y-2 text-[13px]">
            <div>
              <span className="label">Resume</span>
              <div className="mt-0.5"><Value>{record.resumeVariant}</Value></div>
              {record.resumeRationale ? <p className="muted mt-0.5 text-[12px] leading-relaxed">{record.resumeRationale}</p> : null}
            </div>
            <div>
              <span className="label">Portfolio</span>
              {portfolio.length ? (
                <ul className="mt-0.5 space-y-0.5">
                  {portfolio.map((p) => <li key={p.name}>· {p.name} — <span className="muted">{p.reason}</span></li>)}
                </ul>
              ) : (
                <div className="muted mt-0.5 italic">None selected</div>
              )}
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="mb-1 text-[15px] font-semibold">Cover letter</h2>
          {record.coverLetterAngle ? <p className="muted mb-3 text-[12px]">Angle: {record.coverLetterAngle}</p> : null}
          <pre className="hairline max-h-[420px] overflow-auto whitespace-pre-wrap rounded-md border p-4 font-sans text-[13px] leading-relaxed">
            {record.coverLetterDraft ?? "NOT PROVIDED"}
          </pre>
          {record.coverLetterDraft?.includes("[NEEDS:") ? (
            <p className="mt-2 text-[12px] font-medium text-red-700 dark:text-red-400">
              This draft still contains [NEEDS:] markers. Those are facts the agent refused to invent — fill them in
              before this letter goes anywhere.
            </p>
          ) : null}
        </section>

        <section className="card">
          <h2 className="mb-3 text-[15px] font-semibold">Every answer being submitted</h2>
          {record.questions.length === 0 ? (
            <p className="muted text-[13px]">No form questions captured yet.</p>
          ) : (
            <div className="space-y-3">
              {record.questions.map((q) => (
                <div key={q.id} className="hairline border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[13px] font-medium leading-relaxed">
                      {q.questionText}
                      {q.required ? <span className="muted"> *</span> : null}
                    </div>
                    <Badge tone={q.resolution === "RESOLVED" ? "PRIORITY" : "danger"}>
                      {q.resolution.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed">
                    {q.answerText ? q.answerText : <span className="muted italic">No answer — blocked</span>}
                  </div>
                  {q.resolutionNote ? <p className="muted mt-1 text-[12px] leading-relaxed">{q.resolutionNote}</p> : null}
                </div>
              ))}
            </div>
          )}
        </section>

        {attestations.length > 0 ? (
          <section className="card border-red-500/30">
            <h2 className="mb-3 text-[15px] font-semibold">Statements you would be affirming</h2>
            <ul className="space-y-1.5 text-[13px] leading-relaxed">
              {attestations.map((a, i) => <li key={i}>· {a}</li>)}
            </ul>
            <p className="muted mt-3 text-[12px] leading-relaxed">
              The agent has not checked, signed, or affirmed any of these, and it never will. Read each one in full.
            </p>
          </section>
        ) : null}

        <section className="card">
          <h2 className="mb-3 text-[15px] font-semibold">Decision</h2>

          {latest ? (
            <div className="muted mb-4 text-[13px]">
              Most recent decision: <span className="font-medium">{latest.decision}</span> on{" "}
              {latest.decidedAt.toISOString().slice(0, 10)} by {latest.decidedBy}
              {latest.notes ? <div className="mt-0.5 leading-relaxed">{latest.notes}</div> : null}
            </div>
          ) : null}

          <form action={decideApproval} className="space-y-3">
            <input type="hidden" name="packageId" value={record.id} />
            <textarea
              name="notes"
              rows={2}
              placeholder="Notes on this decision (optional, kept for future recommendations)"
              className="hairline w-full rounded-md border bg-transparent px-3 py-2 text-[13px] outline-none"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                name="decision"
                value="APPROVED"
                disabled={readiness.blockers.length > 0}
                className="rounded-md bg-teal-700 px-4 py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                APPROVE APPLICATION
              </button>
              <button
                type="submit"
                name="decision"
                value="CHANGES_REQUESTED"
                className="hairline rounded-md border px-4 py-2 text-[13px] font-medium"
              >
                Request changes
              </button>
              <button
                type="submit"
                name="decision"
                value="REJECTED"
                className="hairline rounded-md border px-4 py-2 text-[13px] font-medium"
              >
                Decline this opportunity
              </button>
            </div>
          </form>

          <div className="hairline mt-6 border-t pt-4">
            <h3 className="text-[13px] font-semibold">After you submit it yourself</h3>
            <p className="muted mt-1 text-[12px] leading-relaxed">
              The agent does not press submit. Once you have submitted the application on the church&apos;s site, record
              it here so the tracker and follow-up schedule stay accurate.
            </p>
            <form action={recordSubmission} className="mt-3 flex gap-2">
              <input type="hidden" name="packageId" value={record.id} />
              <input
                name="note"
                placeholder="Submission note (confirmation number, date, who you sent it to)"
                className="hairline flex-1 rounded-md border bg-transparent px-3 py-1.5 text-[13px] outline-none"
              />
              <button
                type="submit"
                disabled={!submission.canSubmit}
                className="hairline shrink-0 rounded-md border px-3 py-1.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Mark as submitted
              </button>
            </form>
            {!submission.canSubmit ? (
              <p className="muted mt-2 text-[12px]">
                Blocked: {submission.blockers[0]}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
