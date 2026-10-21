"use client";

import { useState } from "react";
import { computeStepsProgress } from "@/lib/portal/gamification";
import ProgressBar from "../ProgressBar";

export interface StepItem {
  id: string;
  title: string;
  detail: string | null;
  dueOn: string | null; // ISO string
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

export default function StepsList({
  initialSteps,
  progress: initialProgress,
}: {
  initialSteps: StepItem[];
  progress?: { done: number; total: number; percent: number };
}) {
  const [steps, setSteps] = useState(initialSteps);
  const [error, setError] = useState<string | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  const progress = initialProgress ?? computeStepsProgress(steps);
  const livePercent = computeStepsProgress(steps).percent;

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

  const now = steps.filter((s) => s.status === "open" && (!s.dueOn || new Date(s.dueOn).getTime() <= Date.now() + 7 * 86400000));
  const comingUp = steps.filter((s) => s.status === "open" && s.dueOn && new Date(s.dueOn).getTime() > Date.now() + 7 * 86400000);
  const done = steps.filter((s) => s.status === "done");
  const allDone = progress.total > 0 && done.length === progress.total;

  return (
    <div className="space-y-8">
      {progress.total > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate">
            <span>
              {done.length} of {progress.total} steps complete
            </span>
            <span>{livePercent}%</span>
          </div>
          <div className="mt-1.5">
            <ProgressBar percent={livePercent} label="Steps progress" />
          </div>
          {allDone && (
            <p className="mt-2 text-sm font-medium text-copper">Every step done — amazing work! 🎉</p>
          )}
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

      <section>
        <h2 className="font-serif text-lg text-navy">Now</h2>
        {now.length === 0 ? (
          <p className="mt-2 text-sm text-slate">Nothing due right now.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {now.map((s) => (
              <StepRow
                key={s.id}
                step={s}
                celebrating={celebratingId === s.id}
                onToggle={(id, checked) => update(id, { status: checked ? "done" : "open" })}
                onNoteSave={(id, note) => update(id, { memberNote: note })}
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-lg text-navy">Coming up</h2>
        {comingUp.length === 0 ? (
          <p className="mt-2 text-sm text-slate">Nothing further out yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {comingUp.map((s) => (
              <StepRow
                key={s.id}
                step={s}
                celebrating={celebratingId === s.id}
                onToggle={(id, checked) => update(id, { status: checked ? "done" : "open" })}
                onNoteSave={(id, note) => update(id, { memberNote: note })}
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-lg text-navy">Done</h2>
        {done.length === 0 ? (
          <p className="mt-2 text-sm text-slate">Nothing marked done yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {done.map((s) => (
              <StepRow
                key={s.id}
                step={s}
                celebrating={celebratingId === s.id}
                onToggle={(id, checked) => update(id, { status: checked ? "done" : "open" })}
                onNoteSave={(id, note) => update(id, { memberNote: note })}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
