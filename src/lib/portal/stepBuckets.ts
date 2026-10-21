/**
 * Buckets a member's open steps by due date using LOCAL calendar-day
 * boundaries (whatever timezone the caller's Date object resolves in —
 * the browser's, when called from a client component). Deliberately not
 * UTC-based: a step due "today" must mean today where the member actually
 * is, not where the server happens to run.
 */

export interface BucketableStep {
  status: "open" | "done";
  dueOn: string | null; // ISO string
}

export interface StepBuckets<T> {
  overdue: T[];
  thisWeek: T[];
  later: T[];
  noDate: T[];
  done: T[];
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function bucketSteps<T extends BucketableStep>(steps: T[], now: Date = new Date()): StepBuckets<T> {
  const today = startOfDay(now);
  const weekEnd = new Date(today.getTime() + 7 * 86400000);

  const buckets: StepBuckets<T> = { overdue: [], thisWeek: [], later: [], noDate: [], done: [] };

  for (const step of steps) {
    if (step.status === "done") {
      buckets.done.push(step);
      continue;
    }
    if (!step.dueOn) {
      buckets.noDate.push(step);
      continue;
    }
    const due = new Date(step.dueOn);
    if (due.getTime() < today.getTime()) {
      buckets.overdue.push(step);
    } else if (due.getTime() < weekEnd.getTime()) {
      buckets.thisWeek.push(step);
    } else {
      buckets.later.push(step);
    }
  }

  return buckets;
}
