import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPortalActor } from "@/lib/portal/auth";
import { listAuditEventsForAdmin } from "@/lib/portal/data/audit";

export const metadata: Metadata = {
  title: "Audit log",
  robots: { index: false, follow: false },
};

export default async function AuditPage({ searchParams }: { searchParams: { action?: string; enrollmentId?: string } }) {
  const actor = (await getPortalActor())!;
  if (!actor.isAdmin) redirect("/portal/admin");

  const events =
    (await listAuditEventsForAdmin(actor, { action: searchParams.action, enrollmentId: searchParams.enrollmentId })) ?? [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-3xl text-navy">Audit log</h1>

      <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="action" className="block text-xs font-medium text-slate">
            Action contains
          </label>
          <input
            id="action"
            name="action"
            defaultValue={searchParams.action ?? ""}
            className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="enrollmentId" className="block text-xs font-medium text-slate">
            Enrollment ID
          </label>
          <input
            id="enrollmentId"
            name="enrollmentId"
            defaultValue={searchParams.enrollmentId ?? ""}
            className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm text-navy">
          Filter
        </button>
      </form>

      <ul className="mt-6 space-y-1">
        {events.map((e) => (
          <li key={e.id} className="flex justify-between rounded-lg bg-mist px-3 py-2 text-sm">
            <span className="text-navy">
              {e.action} <span className="text-slate">— {e.actorRole} · {e.subjectType}</span>
            </span>
            <span className="text-xs text-slate">{new Date(e.at).toLocaleString()}</span>
          </li>
        ))}
        {events.length === 0 && <p className="text-sm text-slate">No matching events.</p>}
      </ul>
    </main>
  );
}
