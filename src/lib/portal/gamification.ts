/**
 * Pure, DB-free helpers for the member-facing progress/engagement UI
 * (progress bars, streaks, phase-path state). No new schema or migration —
 * everything here is derived from fields `portal_action_steps`/
 * `portal_phases` already have (`doneAt`, `order`, `currentPhaseKey`).
 */

export interface StepProgress {
  done: number;
  total: number;
  percent: number; // 0-100, rounded
}

export function computeStepsProgress(steps: { status: string }[]): StepProgress {
  const total = steps.length;
  const done = steps.filter((s) => s.status === "done").length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Consecutive-day streak of step completions, counting back from today (or
 * yesterday, so a streak doesn't reset to 0 first thing in the morning
 * before anything's been checked off yet today).
 */
export function computeStreakDays(doneAts: (Date | null)[], now: Date = new Date()): number {
  const days = new Set(doneAts.filter((d): d is Date => d !== null).map(dayKey));
  if (days.size === 0) return 0;

  let cursor = new Date(now);
  if (!days.has(dayKey(cursor))) {
    cursor = new Date(cursor.getTime() - 86400000);
    if (!days.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return streak;
}

export type PhaseState = "done" | "current" | "upcoming";

export function computePhaseStates<T extends { key: string }>(
  phases: T[],
  currentPhaseKey: string | null
): (T & { state: PhaseState })[] {
  const currentIndex = currentPhaseKey ? phases.findIndex((p) => p.key === currentPhaseKey) : -1;
  return phases.map((phase, i) => ({
    ...phase,
    state: currentIndex === -1 ? (i === 0 ? "current" : "upcoming") : i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming",
  }));
}
