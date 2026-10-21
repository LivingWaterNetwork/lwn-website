import type { Metadata } from "next";
import Link from "next/link";
import { getPortalActor } from "@/lib/portal/auth";
import { listDashboardRows } from "@/lib/portal/data/admin";

export const metadata: Metadata = {
  title: "Coach dashboard",
  robots: { index: false, follow: false },
};

const STATUS_OPTIONS = ["draft", "invited", "active", "paused", "completed", "archived"];

export default async function AdminDashboardPage({ searchParams }: { searchParams: { status?: string } }) {
  const actor = (await getPortalActor())!;
  const rows = (await listDashboardRows(actor, { status: searchParams.status })) ?? [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-navy">Dashboard</h1>
        <Link
          href="/portal/admin/members/new"
          className="min-h-[44px] rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-deep-sea"
        >
          Create member
        </Link>
      </div>

      <form className="mt-4 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label htmlFor="status" className="block text-xs font-medium text-slate">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={searchParams.status ?? ""}
            className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm text-navy"
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm text-navy">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate/20">
          <thead>
            <tr className="text-left text-xs font-medium uppercase text-slate">
              <th className="py-2 pr-4">Member</th>
              <th className="py-2 pr-4">Coach</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate/10">
            {rows.map(({ enrollment, person, coach, flags }) => (
              <tr key={enrollment.id}>
                <td className="py-3 pr-4">
                  <Link href={`/portal/admin/enrollments/${enrollment.id}`} className="font-medium text-lw-blue underline">
                    {person ? `${person.firstName} ${person.lastName}` : "Unknown"}
                  </Link>
                  <p className="text-xs text-slate">{person?.email}</p>
                </td>
                <td className="py-3 pr-4 text-sm text-navy">{coach ? `${coach.firstName} ${coach.lastName}` : "—"}</td>
                <td className="py-3 pr-4 text-sm capitalize text-navy">{enrollment.status}</td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {flags.stepsOverdue && (
                      <span className="rounded-full bg-copper/10 px-2 py-0.5 text-xs text-copper">Steps overdue</span>
                    )}
                    {flags.noRecentSession && (
                      <span className="rounded-full bg-copper/10 px-2 py-0.5 text-xs text-copper">No recent session</span>
                    )}
                    {flags.installmentPastDue && (
                      <span className="rounded-full bg-copper/10 px-2 py-0.5 text-xs text-copper">Payment past due</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="mt-4 text-sm text-slate">No members match this filter.</p>}
      </div>
    </main>
  );
}
