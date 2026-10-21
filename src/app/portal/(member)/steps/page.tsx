import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { getViewedEnrollmentForActor } from "@/lib/portal/data/enrollments";
import { listStepsForActor } from "@/lib/portal/data/steps";
import StepsList, { type StepItem } from "./StepsList";

export const metadata: Metadata = {
  title: "Your steps",
  robots: { index: false, follow: false },
};

export default async function StepsPage() {
  const actor = (await getPortalActor())!;
  const enrollment = await getViewedEnrollmentForActor(actor);
  const steps = enrollment ? ((await listStepsForActor(actor, enrollment.id)) ?? []) : [];

  const items: StepItem[] = steps.map((s) => ({
    id: s.id,
    title: s.title,
    detail: s.detail,
    dueOn: s.dueOn ? s.dueOn.toISOString() : null,
    status: s.status as "open" | "done",
    memberNote: s.memberNote,
  }));

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl text-navy">Your steps</h1>
      {!enrollment ? (
        <p className="mt-4 text-slate">Your program hasn&apos;t been set up here yet.</p>
      ) : (
        <div className="mt-6">
          <StepsList initialSteps={items} />
        </div>
      )}
    </main>
  );
}
