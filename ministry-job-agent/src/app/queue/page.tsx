import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { answerHumanInput, dismissHumanInput } from "../actions";
import { Badge, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const KIND_COPY: Record<string, string> = {
  CANDIDATE_FACT: "The system needs a fact it does not have. It will not guess one.",
  THEOLOGY: "THEOLOGICAL REVIEW REQUIRED — the system will not compose theology on your behalf.",
  APPLICATION_QUESTION: "HUMAN INPUT REQUIRED — no approved answer matches this question.",
  ATTESTATION: "This asks you to affirm or sign something. Only you can answer it.",
  COMPENSATION: "Compensation information is missing.",
};

export default async function QueuePage() {
  const requests = await prisma.humanInputRequest.findMany({
    where: { status: "OPEN" },
    include: { opportunity: { include: { church: true } } },
    orderBy: [{ kind: "asc" }, { createdAt: "asc" }],
  });

  const byKind = requests.reduce<Record<string, typeof requests>>((acc, r) => {
    (acc[r.kind] ??= []).push(r);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Human input required"
        subtitle="Every item here is something the system refused to invent. Answering one stores it for reuse, so you answer each question once."
      />

      {requests.length === 0 ? (
        <EmptyState
          title="Nothing is waiting on you"
          hint="When an application asks for something the agent does not have an approved answer for, it stops and lands here."
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(byKind).map(([kind, items]) => (
            <section key={kind}>
              <h2 className="text-[15px] font-semibold">{kind.replace(/_/g, " ")}</h2>
              <p className="muted mb-3 mt-0.5 text-[13px]">{KIND_COPY[kind] ?? ""}</p>

              <div className="space-y-3">
                {items.map((r) => (
                  <div key={r.id} className="card">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium leading-relaxed">{r.question}</div>
                        {r.opportunity ? (
                          <Link
                            href={`/opportunities/${r.opportunity.id}`}
                            className="muted mt-1 block text-[12px] hover:underline"
                          >
                            {r.opportunity.church.name} — {r.opportunity.title}
                          </Link>
                        ) : null}
                        {r.context ? <p className="muted mt-1.5 text-[12px] leading-relaxed">{r.context}</p> : null}
                      </div>
                      {r.storeTo ? <Badge>saves to {r.storeTo.split(":")[0]}</Badge> : null}
                    </div>

                    <form action={answerHumanInput} className="mt-3">
                      <input type="hidden" name="id" value={r.id} />
                      <textarea
                        name="response"
                        rows={3}
                        required
                        placeholder="Your answer. This is stored exactly as written and used verbatim."
                        className="hairline w-full rounded-md border bg-transparent px-3 py-2 text-[13px] leading-relaxed outline-none focus:ring-1"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="submit"
                          className="rounded-md bg-black px-3 py-1.5 text-[12px] font-medium text-white dark:bg-white dark:text-black"
                        >
                          Save answer
                        </button>
                      </div>
                    </form>

                    <form action={dismissHumanInput} className="mt-2">
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="muted text-[12px] underline underline-offset-4">
                        Not applicable — dismiss
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
