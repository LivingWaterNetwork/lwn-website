import { prisma } from "@/lib/db/client";
import { parseArray } from "@/lib/db/json";
import { DISCOVERY_SOURCES } from "@/lib/discovery/sources";
import { NEVER_AUTONOMOUS } from "@/lib/application/approval-gate";
import { ROLE_TERMS } from "@/lib/discovery/search-terms";
import { Badge, PageHeader, Value } from "@/components/ui";

export const dynamic = "force-dynamic";

const POLICY_TONE: Record<string, string> = {
  AUTOMATED_ALLOWED: "PRIORITY",
  MANUAL_ONLY: "REVIEW",
  API_REQUIRED: "STRONG",
  UNREVIEWED: "neutral",
};

export default async function SettingsPage() {
  const [prefs, holds] = await Promise.all([
    prisma.searchPreference.findUnique({ where: { id: "default" } }),
    prisma.church.findMany({ where: { onHold: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Settings" subtitle="Search preferences, source access policies, and the rules the agent cannot be talked out of." />

      <section className="card mb-6">
        <h2 className="mb-3 text-[15px] font-semibold">Search preferences</h2>
        <dl className="grid gap-x-8 gap-y-3 text-[13px] md:grid-cols-2">
          <div>
            <dt className="label">Geography</dt>
            <dd className="mt-0.5">{prefs?.nationwide ? "Nationwide (United States)" : parseArray<string>(prefs?.statesJson).join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="label">Relocation</dt>
            <dd className="mt-0.5">{prefs?.relocationOpen ? "Open to relocation" : "Not currently open"}</dd>
          </div>
          <div>
            <dt className="label">Employment type</dt>
            <dd className="mt-0.5">{parseArray<string>(prefs?.employmentTypesJson).join(", ").replace(/_/g, " ") || "—"}</dd>
          </div>
          <div>
            <dt className="label">Church type</dt>
            <dd className="mt-0.5">
              {parseArray<string>(prefs?.churchTypesJson).join(", ").replace(/_/g, "-")} preferred; denominational
              Protestant considered on theological and cultural fit
            </dd>
          </div>
          <div>
            <dt className="label">Minimum salary</dt>
            <dd className="mt-0.5"><Value>{prefs?.minSalary ? `$${prefs.minSalary.toLocaleString()}` : ""}</Value></dd>
          </div>
          <div>
            <dt className="label">Preferred salary</dt>
            <dd className="mt-0.5"><Value>{prefs?.preferredSalary ? `$${prefs.preferredSalary.toLocaleString()}` : ""}</Value></dd>
          </div>
          <div>
            <dt className="label">Report threshold</dt>
            <dd className="mt-0.5">Full report generated at {prefs?.reportThreshold ?? 70}+</dd>
          </div>
          <div>
            <dt className="label">Automatic submission</dt>
            <dd className="mt-0.5 font-medium">{prefs?.autoSubmitEnabled ? "ENABLED" : "DISABLED — locked in Phase 1"}</dd>
          </div>
        </dl>
        <p className="muted mt-4 text-[12px] leading-relaxed">
          Edit these directly in the database for now (<code className="font-mono">npm run db:studio</code>), or set the
          salary fields as approved candidate facts, which take precedence.
        </p>
      </section>

      <section className="card mb-6">
        <h2 className="mb-1 text-[15px] font-semibold">Source access policies</h2>
        <p className="muted mb-3 text-[13px] leading-relaxed">
          The agent reads this before it touches a site. Anything not AUTOMATED_ALLOWED produces a manual-review work
          item rather than an automated fetch. No source is scraped against its terms, and no anti-bot system is bypassed.
        </p>
        <div className="space-y-2">
          {DISCOVERY_SOURCES.map((s) => (
            <div key={s.key} className="hairline flex items-start justify-between gap-4 border-b pb-2 last:border-0">
              <div className="min-w-0">
                <div className="text-[13px] font-medium">
                  {s.name} {!s.enabled ? <span className="muted text-[11px]">· disabled</span> : null}
                </div>
                <p className="muted mt-0.5 text-[12px] leading-relaxed">{s.policyNote}</p>
              </div>
              <Badge tone={POLICY_TONE[s.policy] ?? "neutral"}>{s.policy.replace(/_/g, " ")}</Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="card mb-6 border-red-500/30">
        <h2 className="mb-3 text-[15px] font-semibold">Never done without your approval</h2>
        <ul className="space-y-1 text-[13px]">
          {NEVER_AUTONOMOUS.map((n) => <li key={n}>· {n}</li>)}
        </ul>
      </section>

      <section className="card mb-6">
        <h2 className="mb-3 text-[15px] font-semibold">Hold list</h2>
        {holds.length === 0 ? (
          <p className="muted text-[13px]">No churches on hold.</p>
        ) : (
          <div className="space-y-2">
            {holds.map((c) => (
              <div key={c.id}>
                <div className="text-[13px] font-medium">
                  {c.name} <Badge tone="danger">HOLD — DO NOT APPLY</Badge>
                </div>
                <p className="muted mt-0.5 text-[12px] leading-relaxed">{c.holdReason}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 text-[15px] font-semibold">Search terms</h2>
        <div className="flex flex-wrap gap-1.5">
          {(parseArray<string>(prefs?.searchTermsJson).length ? parseArray<string>(prefs?.searchTermsJson) : [...ROLE_TERMS]).map((t) => (
            <span key={t} className="hairline rounded border px-1.5 py-0.5 text-[11px]">{t}</span>
          ))}
        </div>
        <p className="muted mt-3 text-[12px] leading-relaxed">
          Discovery also runs function-first queries, so a role with an unfamiliar title still surfaces if its
          responsibilities match.
        </p>
      </section>
    </>
  );
}
