import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortalActor } from "@/lib/portal/auth";
import { getMeetingForActor } from "@/lib/portal/data/meetings";
import { listStepsForMeeting } from "@/lib/portal/data/steps";

export const metadata: Metadata = {
  title: "Session",
  robots: { index: false, follow: false },
};

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const actor = (await getPortalActor())!;
  const meeting = await getMeetingForActor(actor, params.id);
  if (!meeting) notFound();

  const steps = (await listStepsForMeeting(actor, meeting.enrollmentId, meeting.id)) ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl text-navy">
        {meeting.scheduledAt
          ? new Date(meeting.scheduledAt).toLocaleString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : "Time to be set"}
      </h1>
      <p className="mt-1 text-sm capitalize text-slate">{meeting.status.replace(/_/g, " ")}</p>

      {meeting.sharedRecap ? (
        <section className="mt-6 rounded-xl bg-mist p-6">
          <h2 className="font-serif text-lg text-navy">What we covered</h2>
          <div className="prose prose-sm mt-2 max-w-none text-navy">{meeting.sharedRecap}</div>
        </section>
      ) : (
        <p className="mt-6 rounded-xl bg-mist p-6 text-sm text-slate">
          Your session recap will show here after we meet.
        </p>
      )}

      {steps.length > 0 && (
        <section className="mt-6">
          <h2 className="font-serif text-lg text-navy">Steps from this session</h2>
          <ul className="mt-2 space-y-2">
            {steps.map((step) => (
              <li key={step.id} className="rounded-xl bg-mist p-4 text-sm text-navy">
                {step.title}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
