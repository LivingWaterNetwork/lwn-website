import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { listStepsForActor } from "@/lib/portal/data/steps";
import AddStepForm from "./AddStepForm";

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
      <div className="mt-4">
        <AddStepForm enrollmentId={params.id} />
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((s) => (
          <li key={s.id} className="rounded-lg bg-mist p-3">
            <p className={`text-sm font-medium ${s.status === "done" ? "text-slate line-through" : "text-navy"}`}>
              {s.title}
            </p>
            <p className="text-xs text-slate">
              {s.dueOn ? new Date(s.dueOn).toLocaleDateString() : "No due date"}
              {s.tags.length > 0 ? ` · ${s.tags.join(", ")}` : ""}
            </p>
            {s.memberNote && <p className="mt-1 text-xs italic text-slate">Member note: {s.memberNote}</p>}
          </li>
        ))}
        {steps.length === 0 && <p className="text-sm text-slate">No steps yet.</p>}
      </ul>
    </div>
  );
}
