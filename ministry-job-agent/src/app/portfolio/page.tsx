import { prisma } from "@/lib/db/client";
import { parseArray } from "@/lib/db/json";
import { laneLabel } from "@/lib/domain/lanes";
import { Badge, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const [assets, resumes] = await Promise.all([
    prisma.portfolioAsset.findMany({ orderBy: { name: "asc" } }),
    prisma.resumeVariant.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Portfolio & resumes"
        subtitle="Summaries describe what each body of work is. Scale, reach, budget, and organizational status are candidate facts — they live in the profile only once you approve them."
      />

      <section className="mb-10">
        <h2 className="mb-3 text-[15px] font-semibold">Ministry portfolio</h2>
        <div className="space-y-3">
          {assets.map((a) => {
            const bestFor = parseArray<string>(a.bestForJson);
            return (
              <div key={a.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold">{a.name}</div>
                    <p className="mt-1 text-[13px] leading-relaxed">{a.summary}</p>
                    {a.detail ? <p className="muted mt-2 text-[12px] leading-relaxed">{a.detail}</p> : null}
                    {bestFor.length > 0 ? (
                      <div className="muted mt-2 text-[12px]">
                        Best for: {bestFor.map(laneLabel).join(", ")}
                      </div>
                    ) : null}
                  </div>
                  <Badge tone={a.status === "SUMMARY_ONLY" ? "neutral" : "PRIORITY"}>{a.status.replace(/_/g, " ")}</Badge>
                </div>
                <div className="muted mt-2 font-mono text-[11px]">{a.filePath}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-[15px] font-semibold">Resume variants</h2>
        <p className="muted mb-3 text-[13px] leading-relaxed">
          The agent never writes resume content. Each variant reads a file you supply; tailoring reorders and
          re-emphasizes what is already there and nothing else.
        </p>
        <div className="space-y-2.5">
          {resumes.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold">{r.name}</div>
                  <p className="muted mt-1 text-[13px] leading-relaxed">{r.focus}</p>
                  <div className="muted mt-2 font-mono text-[11px]">
                    {r.sourcePath}
                    {r.atsPath ? ` · ${r.atsPath}` : ""}
                  </div>
                </div>
                <Badge tone={r.status === "APPROVED" ? "PRIORITY" : "neutral"}>{r.status.replace(/_/g, " ")}</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
