import { prisma } from "@/lib/db/client";
import { approveTheologyPosition } from "../actions";
import { Badge, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TheologyPage() {
  const positions = await prisma.theologyPosition.findMany({ orderBy: [{ status: "asc" }, { displayName: "asc" }] });
  const approved = positions.filter((p) => p.status === "APPROVED");
  const undefinedPositions = positions.filter((p) => p.status !== "APPROVED");

  return (
    <>
      <PageHeader
        title="Theology"
        subtitle="The system will never write, infer, or extrapolate a theological position. Any application question touching an undefined topic stops and asks you."
      />

      <div className="card mb-6">
        <div className="flex gap-8 text-[13px]">
          <div>
            <div className="label">Defined</div>
            <div className="mt-1 text-xl font-semibold tabular-nums">{approved.length}</div>
          </div>
          <div>
            <div className="label">Not yet defined</div>
            <div className="mt-1 text-xl font-semibold tabular-nums">{undefinedPositions.length}</div>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        {positions.map((p) => (
          <details key={p.id} className="card" open={p.status !== "APPROVED" && undefinedPositions.indexOf(p) < 1}>
            <summary className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-[14px] font-medium">{p.displayName}</span>
              {p.status === "APPROVED" ? <Badge tone="PRIORITY">APPROVED</Badge> : <Badge>NOT YET DEFINED</Badge>}
            </summary>

            {p.position ? (
              <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed">{p.position}</p>
            ) : (
              <p className="muted mt-3 text-[13px]">
                No position on record. The agent returns THEOLOGICAL REVIEW REQUIRED for any question about this topic.
              </p>
            )}

            <form action={approveTheologyPosition} className="mt-4 space-y-2">
              <input type="hidden" name="topic" value={p.topic} />
              <textarea
                name="position"
                rows={4}
                required
                defaultValue={p.position ?? ""}
                placeholder="Your position, in your own words. Used verbatim — never paraphrased."
                className="hairline w-full rounded-md border bg-transparent px-3 py-2 text-[13px] leading-relaxed outline-none"
              />
              <input
                name="shortForm"
                defaultValue={p.shortForm ?? ""}
                placeholder="Short form, for character-limited fields (optional)"
                className="hairline w-full rounded-md border bg-transparent px-3 py-2 text-[13px] outline-none"
              />
              <label className="flex items-center gap-2 text-[12px]">
                <input type="checkbox" name="allowAutomaticUse" defaultChecked={p.allowAutomaticUse} />
                Allow the agent to use this automatically on application forms
              </label>
              <button
                type="submit"
                className="rounded-md bg-black px-3 py-1.5 text-[12px] font-medium text-white dark:bg-white dark:text-black"
              >
                Approve position
              </button>
            </form>
          </details>
        ))}
      </section>
    </>
  );
}
