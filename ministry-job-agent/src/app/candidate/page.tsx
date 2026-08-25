import { prisma } from "@/lib/db/client";
import { approveCandidateFact } from "../actions";
import { parseJson } from "@/lib/db/json";
import { PHASE_2_ORDER } from "@/lib/candidate/schema";
import { Badge, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CandidatePage() {
  const [facts, records, claims] = await Promise.all([
    prisma.candidateFact.findMany({ orderBy: [{ category: "asc" }, { label: "asc" }] }),
    prisma.candidateRecord.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }] }),
    prisma.extractedClaim.count({ where: { status: "UNVERIFIED_IMPORT" } }),
  ]);

  const approved = facts.filter((f) => f.status === "APPROVED").length;
  const byCategory = facts.reduce<Record<string, typeof facts>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Candidate profile"
        subtitle={`${approved} of ${facts.length} facts approved. Anything not approved here is treated as NOT PROVIDED and will stop an application rather than be guessed.`}
      />

      {claims > 0 ? (
        <div className="card mb-6 border-amber-500/40 bg-amber-500/[0.06]">
          <div className="text-[13px] font-semibold">{claims} imported claim{claims === 1 ? "" : "s"} await review</div>
          <p className="muted mt-1 text-[13px]">
            Imported material is UNVERIFIED_IMPORT until you approve it. Nothing imported is usable in an application.
          </p>
        </div>
      ) : null}

      <div className="space-y-8">
        {Object.entries(byCategory).map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-3 text-[15px] font-semibold capitalize">{category}</h2>
            <div className="space-y-2">
              {items.map((f) => {
                const value = parseJson<unknown>(f.valueJson, null);
                return (
                  <div key={f.id} className="card">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium">
                          {f.label}
                          {f.sensitive ? <span className="muted ml-2 text-[11px]">sensitive</span> : null}
                        </div>
                        <div className="mt-0.5 text-[13px]">
                          {f.status === "APPROVED" && value != null ? (
                            String(value)
                          ) : (
                            <span className="muted italic">NOT PROVIDED</span>
                          )}
                        </div>
                        {f.notes ? <p className="muted mt-1 text-[12px] leading-relaxed">{f.notes}</p> : null}
                      </div>
                      {f.status === "APPROVED" ? <Badge tone="PRIORITY">APPROVED</Badge> : <Badge>{f.status.replace(/_/g, " ")}</Badge>}
                    </div>

                    <form action={approveCandidateFact} className="mt-3 flex gap-2">
                      <input type="hidden" name="path" value={f.path} />
                      <input
                        name="value"
                        required
                        defaultValue={value != null ? String(value) : ""}
                        placeholder="Value — stored and used exactly as entered"
                        className="hairline flex-1 rounded-md border bg-transparent px-3 py-1.5 text-[13px] outline-none"
                      />
                      <button
                        type="submit"
                        className="shrink-0 rounded-md bg-black px-3 py-1.5 text-[12px] font-medium text-white dark:bg-white dark:text-black"
                      >
                        Approve
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <section>
          <h2 className="mb-3 text-[15px] font-semibold">Records</h2>
          {records.length === 0 ? (
            <div className="card">
              <p className="muted text-[13px]">
                No employment, ministry, education, credential, or reference records yet. Import source documents into{" "}
                <code className="font-mono text-[12px]">./inbox</code> and run{" "}
                <code className="font-mono text-[12px]">npm run import</code>, then approve what is accurate.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((r) => (
                <div key={r.id} className="card flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="label">{r.kind}</div>
                    <pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed">
                      {JSON.stringify(parseJson(r.payload, {}), null, 2)}
                    </pre>
                  </div>
                  <Badge tone={r.status === "APPROVED" ? "PRIORITY" : "neutral"}>{r.status.replace(/_/g, " ")}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-[15px] font-semibold">What to supply next</h2>
          <div className="card">
            <p className="muted mb-3 text-[13px] leading-relaxed">
              Phase 2 works through these groups in order. This is the minimum needed to search responsibly, not an
              exhaustive questionnaire.
            </p>
            <ol className="space-y-2 text-[13px]">
              {PHASE_2_ORDER.map((g, i) => (
                <li key={g.group}>
                  <span className="font-medium">{i + 1}. {g.group}</span>
                  <div className="muted leading-relaxed">{g.description}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </>
  );
}
