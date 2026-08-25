import { prisma } from "@/lib/db/client";
import { approveAnswer } from "../actions";
import { CATEGORY_BY_KEY } from "@/lib/answers/categories";
import { Badge, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AnswersPage() {
  const entries = await prisma.answerBankEntry.findMany({
    where: { status: { not: "RETIRED" } },
    orderBy: [{ category: "asc" }, { question: "asc" }],
  });

  const byCategory = entries.reduce<Record<string, typeof entries>>((acc, e) => {
    (acc[e.category] ??= []).push(e);
    return acc;
  }, {});

  const approvedCount = entries.filter((e) => e.status === "APPROVED").length;

  return (
    <>
      <PageHeader
        title="Answer bank"
        subtitle={`${approvedCount} of ${entries.length} approved. Only APPROVED answers are ever used on an application, and only those marked for automatic use are filled without you.`}
      />

      <div className="space-y-8">
        {Object.entries(byCategory).map(([category, items]) => {
          const spec = CATEGORY_BY_KEY.get(category);
          return (
            <section key={category}>
              <h2 className="text-[15px] font-semibold">{spec?.label ?? category}</h2>
              {spec ? <p className="muted mb-3 mt-0.5 text-[13px]">{spec.description}</p> : null}

              <div className="space-y-2.5">
                {items.map((e) => (
                  <details key={e.id} className="card">
                    <summary className="flex cursor-pointer items-start justify-between gap-3">
                      <span className="text-[13px] font-medium leading-relaxed">{e.question}</span>
                      <span className="shrink-0 space-x-1.5">
                        {e.status === "APPROVED" ? <Badge tone="PRIORITY">APPROVED</Badge> : <Badge>DRAFT</Badge>}
                        {e.allowAutomaticUse ? <Badge>auto</Badge> : null}
                      </span>
                    </summary>

                    <form action={approveAnswer} className="mt-3 space-y-2">
                      <input type="hidden" name="id" value={e.id} />
                      <textarea
                        name="approvedAnswer"
                        rows={5}
                        required
                        defaultValue={e.approvedAnswer}
                        placeholder="Your answer, in your own words. Never generated or embellished by the agent."
                        className="hairline w-full rounded-md border bg-transparent px-3 py-2 text-[13px] leading-relaxed outline-none"
                      />
                      <div className="grid gap-2 md:grid-cols-3">
                        <input
                          name="shortVersion"
                          defaultValue={e.shortVersion ?? ""}
                          placeholder="Short version"
                          className="hairline rounded-md border bg-transparent px-3 py-2 text-[12px] outline-none"
                        />
                        <input
                          name="mediumVersion"
                          defaultValue={e.mediumVersion ?? ""}
                          placeholder="Medium version"
                          className="hairline rounded-md border bg-transparent px-3 py-2 text-[12px] outline-none"
                        />
                        <input
                          name="longVersion"
                          defaultValue={e.longVersion ?? ""}
                          placeholder="Long version"
                          className="hairline rounded-md border bg-transparent px-3 py-2 text-[12px] outline-none"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-[12px]">
                        <input type="checkbox" name="allowAutomaticUse" defaultChecked={e.allowAutomaticUse} />
                        Allow automatic use on application forms
                      </label>
                      <button
                        type="submit"
                        className="rounded-md bg-black px-3 py-1.5 text-[12px] font-medium text-white dark:bg-white dark:text-black"
                      >
                        Approve answer
                      </button>
                    </form>
                  </details>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
