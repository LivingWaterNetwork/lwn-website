import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { listEnrollmentActivityForStaff } from "@/lib/portal/data/admin";

export const metadata: Metadata = {
  title: "Activity",
  robots: { index: false, follow: false },
};

export default async function AdminActivityPage({ params }: { params: { id: string } }) {
  const actor = (await getPortalActor())!;
  const events = (await listEnrollmentActivityForStaff(actor, params.id)) ?? [];

  return (
    <div>
      <h2 className="font-serif text-xl text-navy">Activity</h2>
      <ul className="mt-4 space-y-1">
        {events.map((e) => (
          <li key={e.id} className="flex justify-between rounded-lg bg-mist px-3 py-2 text-sm">
            <span className="text-navy">
              {e.action.replace(/_/g, " ")} <span className="text-slate">— {e.actorRole}</span>
            </span>
            <span className="text-xs text-slate">{new Date(e.at).toLocaleString()}</span>
          </li>
        ))}
        {events.length === 0 && <p className="text-sm text-slate">No activity yet.</p>}
      </ul>
    </div>
  );
}
