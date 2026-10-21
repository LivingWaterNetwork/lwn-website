"use client";

import { computeStepsProgress, computeStreakDays } from "@/lib/portal/gamification";
import { useHideProgress } from "./ProgressGate";

export interface ProgressStepInput {
  status: "open" | "done";
  doneAt: string | null; // ISO string
}

/**
 * Personal, optional progress summary — plain "X of Y steps done" wording
 * only, no percentage, no comparison to anyone else. Computed client-side
 * so the streak's day boundaries use the member's own local timezone.
 * Hidden entirely when the member has opted out on this device.
 */
export default function HomeProgressCard({ steps }: { steps: ProgressStepInput[] }) {
  const [hideProgress] = useHideProgress();
  if (hideProgress || steps.length === 0) return null;

  const progress = computeStepsProgress(steps);
  const streak = computeStreakDays(steps.map((s) => (s.doneAt ? new Date(s.doneAt) : null)));

  return (
    <section className="rounded-xl bg-navy p-6 text-white">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg">Your progress</h2>
        {streak > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-copper px-3 py-1 text-xs font-semibold">
            <span aria-hidden="true">🔥</span>
            {streak} day{streak === 1 ? "" : "s"} in a row
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-mist">
        {progress.done} of {progress.total} steps done
      </p>
    </section>
  );
}
