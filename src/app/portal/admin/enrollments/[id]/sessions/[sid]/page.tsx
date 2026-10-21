import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortalActor } from "@/lib/portal/auth";
import { getMeetingWithPrivateNotesForStaff } from "@/lib/portal/data/meetings";
import { listStepsForMeeting } from "@/lib/portal/data/steps";
import SessionEditForm from "./SessionEditForm";
import PrivateNotes from "./PrivateNotes";
import CreateStepFromSession from "./CreateStepFromSession";

export const metadata: Metadata = {
  title: "Session",
  robots: { index: false, follow: false },
};

export default async function AdminSessionDetailPage({ params }: { params: { id: string; sid: string } }) {
  const actor = (await getPortalActor())!;
  const result = await getMeetingWithPrivateNotesForStaff(actor, params.sid);
  if (!result) notFound();
  const { meeting, notes } = result;

  const steps = (await listStepsForMeeting(actor, params.id, params.sid)) ?? [];

  return (
    <div className="space-y-6">
      <SessionEditForm
        sessionId={meeting.id}
        scheduledAt={meeting.scheduledAt ? meeting.scheduledAt.toISOString() : null}
        durationMin={meeting.durationMin}
        format={meeting.format}
        status={meeting.status}
        countsTowardTotal={meeting.countsTowardTotal}
        sharedRecap={meeting.sharedRecap}
      />

      <section>
        <h3 className="font-serif text-lg text-navy">Steps from this session</h3>
        <ul className="mt-2 space-y-2">
          {steps.map((s) => (
            <li key={s.id} className="rounded-lg bg-mist p-3 text-sm text-navy">
              {s.title}
            </li>
          ))}
        </ul>
        <CreateStepFromSession enrollmentId={params.id} sessionId={params.sid} />
      </section>

      <PrivateNotes
        sessionId={meeting.id}
        notes={notes.map((n) => ({ id: n.id, body: n.body, createdAt: n.createdAt.toISOString() }))}
      />
    </div>
  );
}
