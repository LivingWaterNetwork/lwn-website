"use client";

import { useState } from "react";
import { bucketSteps } from "@/lib/portal/stepBuckets";
import { computeStreakDays } from "@/lib/portal/gamification";
import { useHideProgress } from "../ProgressGate";

export interface StepItem {
  id: string;
  title: string;
  detail: string | null;
  dueOn: string | null; // ISO string
  doneAt: string | null; // ISO string
  status: "open" | "done";
  memberNote: string | null;
}

const CELEBRATIONS = ["🎉", "✨", "🙌", "🔥", "⭐"];

function Celebration() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute -right-1 -top-3 select-none text-lg animate-celebrate-pop">
      {CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)]}
    </span>
  );
}

function formatDue(dueOn: string | null): string {
  if (!dueOn) return "No due date";
  return new Date(dueOn).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StepRow({
  step,
  celebrating,
  onToggle,
  onNoteSave,
}: {
  step: StepItem;
  celebrating: boolean;
  onToggle: (id: string, done: boolean) => void;
  onNoteSave: (id: string, note: string) => void;
}) {
  const [noteDraft, setNoteDraft] = useState(step.memberNote ?? "");
  const [editingNote, setEditingNote] = useState(false);

  return (
    <li className="relative rounded-xl bg-mist p-4">
      {celebrating && <Celebration />}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={step.status === "done"}
          onChange={(e) => onToggle(step.id, e.target.checked)}
          aria-label={`Mark "${step.title}" as ${step.status === "done" ? "not done" : "done"}`}
          className="mt-1 h-5 w-5 min-h-[20px] min-w-[20px] rounded border-slate/40"
        />
        <div className="flex-1">
          <p className={`text-sm font-medium ${step.status === "done" ? "text-slate line-through" : "text-navy"}`}>
            {step.title}
          </p>
          {step.detail && <p className="mt-0.5 text-xs text-slate">{step.detail}</p>}
          <p className="mt-1 text-xs text-slate">{formatDue(step.dueOn)}</p>

          {!editingNote && (
            <button
              type="button"
              onClick={() => setEditingNote(true)}
              className="mt-2 min-h-[44px] text-xs font-medium text-lw-blue underline"
            >
              {step.memberNote ? "Edit note" : "Add a note"}
            </button>
          )}
          {editingNote && (
            <div className="mt-2">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value.slice(0, 500))}
                maxLength={500}
                rows={2}
                aria-label="Your note"
                className="block w-full rounded-lg border border-slate/30 p-2 text-sm text-navy focus:border-lw-blue focus:outline-none focus:ring-2 focus:ring-lw-blue"
              />
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-slate">{noteDraft.length}/500</span>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      onNoteSave(step.id, noteDraft);
                      setEditingNote(false);
                    }}
                    className="min-h-[44px] rounded-lg bg-navy px-3 py-1 text-xs font-medium text-white"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteDraft(step.memberNote ?? "");
                      setEditingNote(false);
                    }}
                    className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-1 text-xs font-medium text-navy"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function StepSection({
  title,
  steps,
  emptyLabel,
  celebratingId,
  onToggle,
  onNoteSave,
}: {
  title: string;
  steps: StepItem[];
  emptyLabel: string;
  celebratingId: string | null;
  onToggle: (id: string, done: boolean) => void;
  onNoteSave: (id: string, note: string) => void;
}) {
  return (
    <section>
      <h2 className="font-serif text-lg text-navy">{title}</h2>
      {steps.length === 0 ? (
        <p className="mt-2 text-sm text-slate">{emptyLabel}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {steps.map((s) => (
            <StepRow key={s.id} step={s} celebrating={celebratingId === s.id} onToggle={onToggle} onNoteSave={onNoteSave} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function StepsList({ initialSteps }: { initialSteps: StepItem[] }) {
  const [steps, setSteps] = useState(initialSteps);
  const [error, setError] = useState<string | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [hideProgress] = useHideProgress();

  async function update(id: string, patch: { status?: "open" | "done"; memberNote?: string }) {
    const previous = steps;
    setSteps((cur) => cur.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setError(null);

    if (patch.status === "done") {
      setCelebratingId(id);
      setTimeout(() => setCelebratingId((cur) => (cur === id ? null : cur)), 900);
    }

    try {
      const current = previous.find((s) => s.id === id)!;
      const res = await fetch(`/api/portal/me/steps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: patch.status ?? current.status,
          memberNote: patch.memberNote ?? current.memberNote ?? undefined,
        }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSteps(previous); // server state wins — roll back the optimistic update
      setError("That didn't save. Please try again.");
    }
  }

  const buckets = bucketSteps(steps);
  const total = steps.length;
  const allDone = total > 0 && buckets.done.length === total;
  // Computed client-side so "today" uses this member's own local timezone,
  // not the server's.
  const streak = computeStreakDays(steps.map((s) => (s.doneAt ? new Date(s.doneAt) : null)));

  const onToggle = (id: string, checked: boolean) => update(id, { status: checked ? "done" : "open" });
  const onNoteSave = (id: string, note: string) => update(id, { memberNote: note });

  return (
    <div className="space-y-8">
      {!hideProgress && total > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate">
              {buckets.done.length} of {total} steps done
            </p>
            {streak > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-copper/10 px-3 py-1 text-xs font-semibold text-copper">
                <span aria-hidden="true">🔥</span>
                {streak}-day streak
              </span>
            )}
          </div>
          {allDone && <p className="mt-1 text-sm font-medium text-copper">Every step done — amazing work! 🎉</p>}
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center justify-between rounded-lg bg-copper/10 p-3 text-sm text-copper">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      <StepSection
        title="Overdue"
        steps={buckets.overdue}
        emptyLabel="Nothing overdue."
        celebratingId={celebratingId}
        onToggle={onToggle}
        onNoteSave={onNoteSave}
      />

      <StepSection
        title="This week"
        steps={buckets.thisWeek}
        emptyLabel="Nothing due this week."
        celebratingId={celebratingId}
        onToggle={onToggle}
        onNoteSave={onNoteSave}
      />

      <StepSection
        title="Later"
        steps={buckets.later}
        emptyLabel="Nothing further out yet."
        celebratingId={celebratingId}
        onToggle={onToggle}
        onNoteSave={onNoteSave}
      />

      {buckets.noDate.length > 0 && (
        <StepSection
          title="No due date"
          steps={buckets.noDate}
          emptyLabel=""
          celebratingId={celebratingId}
          onToggle={onToggle}
          onNoteSave={onNoteSave}
        />
      )}

      <StepSection
        title="Done"
        steps={buckets.done}
        emptyLabel="Nothing marked done yet."
        celebratingId={celebratingId}
        onToggle={onToggle}
        onNoteSave={onNoteSave}
      />
    </div>
  );
}
