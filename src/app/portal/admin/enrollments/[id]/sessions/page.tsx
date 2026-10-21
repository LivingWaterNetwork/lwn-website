import type { Metadata } from "next";
import Link from "next/link";
import { getPortalActor } from "@/lib/portal/auth";
import { listMeetingsForActor } from "@/lib/portal/data/meetings";
import NewSessionButton from "./NewSessionButton";

export const metadata: Metadata = {
  title: "Sessions",
  robots: { index: false, follow: false },
};

export default async function AdminSessionsPage({ params }: { params: { id: string } }) {
  const actor = (await getPortalActor())!;
  const meetings = (await listMeetingsForActor(actor, params.id)) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-navy">Sessions</h2>
        <NewSessionButton enrollmentId={params.id} />
      </div>
      <ul className="mt-4 space-y-2">
        {meetings.map((m) => (
          <li key={m.id}>
            <Link
              href={`/portal/admin/enrollments/${params.id}/sessions/${m.id}`}
              className="block rounded-xl bg-mist p-4 hover:bg-mist/70"
            >
              <p className="text-sm font-medium text-navy">
                {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : "Time to be set"}
              </p>
              <p className="text-xs capitalize text-slate">{m.status.replace(/_/g, " ")}</p>
            </Link>
          </li>
        ))}
        {meetings.length === 0 && <p className="text-sm text-slate">No sessions yet.</p>}
      </ul>
    </div>
  );
}
