import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { Badge, PageHeader, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [
    discovered,
    priority,
    strong,
    review,
    submitted,
    interviews,
    followUpsDue,
    openInputs,
    theologyOpen,
    factsMissing,
    answersDraft,
    holdCount,
    recent,
  ] = await Promise.all([
    prisma.opportunity.count(),
    prisma.opportunity.count({ where: { classification: "PRIORITY" } }),
    prisma.opportunity.count({ where: { classification: "STRONG" } }),
    prisma.opportunity.count({ where: { classification: "REVIEW" } }),
    prisma.applicationPackage.count({ where: { status: "SUBMITTED" } }),
    prisma.opportunity.count({
      where: { status: { in: ["INTERVIEW_REQUESTED", "INTERVIEW_SCHEDULED", "INTERVIEW_ROUND_1", "INTERVIEW_ROUND_2", "FINAL_INTERVIEW"] } },
    }),
    prisma.followUp.count({ where: { status: "DUE", dueDate: { lte: new Date() } } }),
    prisma.humanInputRequest.count({ where: { status: "OPEN" } }),
    prisma.theologyPosition.count({ where: { status: { not: "APPROVED" } } }),
    prisma.candidateFact.count({ where: { status: { not: "APPROVED" } } }),
    prisma.answerBankEntry.count({ where: { status: "DRAFT" } }),
    prisma.church.count({ where: { onHold: true } }),
    prisma.opportunity.findMany({
      where: { classification: { in: ["PRIORITY", "STRONG", "REVIEW"] } },
      include: { church: true },
      orderBy: [{ score: "desc" }],
      take: 8,
    }),
  ]);

  const blockedFromApplying = factsMissing > 0 || theologyOpen > 0;

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Ministry fit over application volume. Nothing is submitted without your explicit approval."
      />

      {blockedFromApplying ? (
        <div className="card mb-6 border-amber-500/40 bg-amber-500/[0.06]">
          <div className="text-[13px] font-semibold">Profile incomplete — real applications are not yet possible</div>
          <p className="muted mt-1.5 text-[13px] leading-relaxed">
            {factsMissing} candidate fact{factsMissing === 1 ? "" : "s"} and {theologyOpen} theological position
            {theologyOpen === 1 ? "" : "s"} are still undefined. The agent will not fill these in for you — every
            application that touches them will stop and ask.
          </p>
          <div className="mt-3 flex gap-3 text-[13px]">
            <Link href="/candidate" className="font-medium underline underline-offset-4">
              Complete candidate profile
            </Link>
            <Link href="/theology" className="font-medium underline underline-offset-4">
              Define theology
            </Link>
          </div>
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Opportunities" value={discovered} href="/pipeline" />
        <Stat label="Priority" value={priority} href="/pipeline?c=PRIORITY" />
        <Stat label="Strong" value={strong} href="/pipeline?c=STRONG" />
        <Stat label="Review" value={review} href="/pipeline?c=REVIEW" />
      </section>

      <section className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Applications submitted" value={submitted} />
        <Stat label="Interviews" value={interviews} />
        <Stat label="Follow-ups due" value={followUpsDue} tone={followUpsDue > 0 ? "danger" : "default"} />
        <Stat label="Human input required" value={openInputs} href="/queue" tone={openInputs > 0 ? "danger" : "default"} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[15px] font-semibold">Strongest opportunities</h2>
        {recent.length === 0 ? (
          <div className="hairline rounded-lg border border-dashed p-8 text-center">
            <div className="text-[14px] font-medium">No scored opportunities yet</div>
            <p className="muted mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed">
              Add postings to <code className="font-mono text-[12px]">./inbox</code> and run{" "}
              <code className="font-mono text-[12px]">npm run import</code>, then{" "}
              <code className="font-mono text-[12px]">npm run score</code>.
            </p>
          </div>
        ) : (
          <div className="hairline overflow-hidden rounded-lg border">
            <table className="w-full text-[13px]">
              <thead className="hairline border-b bg-black/[0.02] dark:bg-white/[0.03]">
                <tr className="label">
                  <th className="px-4 py-2.5 text-left font-semibold">Church</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Role</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Location</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Score</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Class</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="hairline border-b last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
                    <td className="px-4 py-2.5">
                      <Link href={`/opportunities/${o.id}`} className="font-medium hover:underline">
                        {o.church.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">{o.title}</td>
                    <td className="muted px-4 py-2.5">{[o.city, o.state].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">{o.score ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={o.classification ?? "PASS"}>{o.classification ?? "UNSCORED"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-3 md:grid-cols-3">
        <Stat label="Answer bank drafts" value={answersDraft} href="/answers" />
        <Stat label="Theology undefined" value={theologyOpen} href="/theology" />
        <Stat label="Churches on hold" value={holdCount} href="/settings" />
      </section>
    </>
  );
}
