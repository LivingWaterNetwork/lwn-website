import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { listStepsForActor } from "@/lib/portal/data/steps";
import AddStepForm from "./AddStepForm";
import StepsAdminList from "./StepsAdminList";

export const metadata: Metadata = {
  title: "Steps",
  robots: { index: false, follow: false },
};

export default async function AdminStepsPage({ params }: { params: { id: string } }) {
  const actor = (await getPortalActor())!;
  const steps = (await listStepsForActor(actor, params.id)) ?? [];

  return (
    <div>
      <h2 className="font-serif text-xl text-navy">Steps</h2>
      <p className="mt-1 text-xs text-slate">Use the arrows to reorder. The member sees steps in this order.</p>
      <div className="mt-4">
        <AddStepForm enrollmentId={params.id} />
      </div>
      <div className="mt-4">
        <StepsAdminList
          enrollmentId={params.id}
          initialSteps={steps.map((s) => ({
            id: s.id,
            title: s.title,
            status: s.status as "open" | "done",
            dueOn: s.dueOn ? s.dueOn.toISOString() : null,
            tags: s.tags,
            memberNote: s.memberNote,
          }))}
        />
      </div>
    </div>
  );
}
