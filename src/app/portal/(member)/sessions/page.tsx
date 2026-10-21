import type { Metadata } from "next";
import Link from "next/link";
import { getPortalActor } from "@/lib/portal/auth";
import { getViewedEnrollmentForActor } from "@/lib/portal/data/enrollments";
import { listMeetingsForActor } from "@/lib/portal/data/meetings";

export const metadata: Metadata = {
  title: "Your sessions",
  robots: { index: false, follow: false },
};

function formatWhen(scheduledAt: Date | null): string {
  if (!scheduledAt) return "Time to be set";
  return new Date(scheduledAt).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SessionsPage() {
  const actor = (await getPortalActor())!;
  const enrollment = await getViewedEnrollmentForActor(actor);
  const meetings = enrollment ? ((await listMeetingsForActor(actor, enrollment.id)) ?? []) : [];

  const now = Date.now();
  const upcoming = meetings.filter((m) => !m.scheduledAt || m.scheduledAt.getTime() >= now);
  const past = meetings.filter((m) => m.scheduledAt && m.scheduledAt.getTime() < now);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl text-navy">Your sessions</h1>

      <section className="mt-6">
        <h2 className="font-serif text-lg text-navy">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-slate">Nothing scheduled yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {upcoming.map((m) => (
              <li key={m.id}>
                <Link href={`/portal/sessions/${m.id}`} className="block rounded-xl bg-mist p-4 hover:bg-mist/70">
                  <p className="text-sm font-medium text-navy">{formatWhen(m.scheduledAt)}</p>
                  <p className="text-xs text-slate capitalize">{m.status.replace(/_/g, " ")}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-lg text-navy">Past</h2>
        {past.length === 0 ? (
          <p className="mt-2 text-sm text-slate">No past sessions yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {past.map((m) => (
              <li key={m.id}>
                <Link href={`/portal/sessions/${m.id}`} className="block rounded-xl bg-mist p-4 hover:bg-mist/70">
                  <p className="text-sm font-medium text-navy">{formatWhen(m.scheduledAt)}</p>
                  <p className="text-xs text-slate capitalize">{m.status.replace(/_/g, " ")}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
