"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface AdminStepItem {
  id: string;
  title: string;
  status: "open" | "done";
  dueOn: string | null;
  tags: string[];
  memberNote: string | null;
}

export default function StepsAdminList({
  enrollmentId,
  initialSteps,
}: {
  enrollmentId: string;
  initialSteps: AdminStepItem[];
}) {
  const router = useRouter();
  const [steps, setSteps] = useState(initialSteps);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const previous = steps;
    const reordered = [...steps];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    setSteps(reordered);
    setBusyId(steps[index].id);
    setError(null);

    try {
      const res = await fetch(`/api/portal/admin/enrollments/${enrollmentId}/steps/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepIds: reordered.map((s) => s.id) }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setSteps(previous); // server state wins — roll back the optimistic reorder
      setError("That didn't save. Refresh and try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {error && (
        <div role="alert" className="mb-2 flex items-center justify-between rounded-lg bg-copper/10 p-3 text-sm text-copper">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-medium underline">
            Dismiss
          </button>
        </div>
      )}
      <ul className="space-y-2">
        {steps.map((s, i) => (
          <li key={s.id} className="flex items-start gap-2 rounded-lg bg-mist p-3">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0 || busyId !== null}
                aria-label={`Move "${s.title}" up`}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded border border-slate/30 text-navy disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === steps.length - 1 || busyId !== null}
                aria-label={`Move "${s.title}" down`}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded border border-slate/30 text-navy disabled:opacity-30"
              >
                ↓
              </button>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${s.status === "done" ? "text-slate line-through" : "text-navy"}`}>
                {s.title}
              </p>
              <p className="text-xs text-slate">
                {s.dueOn ? new Date(s.dueOn).toLocaleDateString() : "No due date"}
                {s.tags.length > 0 ? ` · ${s.tags.join(", ")}` : ""}
              </p>
              {s.memberNote && <p className="mt-1 text-xs italic text-slate">Member note: {s.memberNote}</p>}
            </div>
          </li>
        ))}
        {steps.length === 0 && <p className="text-sm text-slate">No steps yet.</p>}
      </ul>
    </div>
  );
}
