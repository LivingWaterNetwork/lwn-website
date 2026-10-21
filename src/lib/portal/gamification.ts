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

// Local calendar-day key — NOT UTC. A completion "today" has to mean today
// wherever the caller's Date resolves to (the browser's zone, when called
// from a client component), not the server's zone.
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Consecutive-day streak of step completions, counting back from today (or
 * yesterday, so a streak doesn't reset to 0 first thing in the morning
 * before anything's been checked off yet today). Call this from a client
 * component so `now` (and every `doneAt`) resolves in the member's own
 * local timezone, not the server's.
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

/**
 * The one shared "which phase is the member in right now" resolver — used
 * by both the Home page and the Journey page so they can never disagree.
 * Precedence: an explicit admin/coach override (`currentPhaseKey`) first,
 * then whichever phase's date range covers today, then the first phase.
 */
export function resolveCurrentPhaseKey<T extends { key: string; startsOn: Date | null; endsOn: Date | null }>(
  phases: T[],
  currentPhaseKey: string | null,
  now: Date = new Date()
): string | null {
  if (currentPhaseKey) return currentPhaseKey;
  const byDateRange = phases.find((p) => p.startsOn && p.endsOn && p.startsOn <= now && now <= p.endsOn);
  if (byDateRange) return byDateRange.key;
  return phases[0]?.key ?? null;
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
