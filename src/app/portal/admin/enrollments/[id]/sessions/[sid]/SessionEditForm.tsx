"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = ["scheduled", "held", "rescheduled", "canceled_by_coach", "late_cancel", "missed"];

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SessionEditForm({
  sessionId,
  scheduledAt,
  durationMin,
  format,
  status,
  countsTowardTotal,
  sharedRecap,
}: {
  sessionId: string;
  scheduledAt: string | null;
  durationMin: number;
  format: string;
  status: string;
  countsTowardTotal: boolean;
  sharedRecap: string | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    scheduledAt: toLocalInputValue(scheduledAt),
    durationMin,
    format,
    status,
    countsTowardTotal,
    sharedRecap: sharedRecap ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/portal/admin/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
          durationMin: form.durationMin,
          format: form.format,
          status: form.status,
          countsTowardTotal: form.countsTowardTotal,
          sharedRecap: form.sharedRecap || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "That didn't save.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("We couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-mist p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="scheduledAt" className="block text-sm font-medium text-navy">
            Date and time
          </label>
          <input
            id="scheduledAt"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="durationMin" className="block text-sm font-medium text-navy">
            Duration (minutes)
          </label>
          <input
            id="durationMin"
            type="number"
            min={1}
            value={form.durationMin}
            onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
            className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="format" className="block text-sm font-medium text-navy">
            Format
          </label>
          <select
            id="format"
            value={form.format}
            onChange={(e) => setForm({ ...form, format: e.target.value })}
            className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
          >
            <option value="zoom">Zoom</option>
            <option value="phone">Phone</option>
            <option value="in_person">In person</option>
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-navy">
            Status
          </label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          checked={form.countsTowardTotal}
          onChange={(e) => setForm({ ...form, countsTowardTotal: e.target.checked })}
          className="h-5 w-5 rounded border-slate/40"
        />
        Counts toward the total session count
      </label>

      <div>
        <label htmlFor="sharedRecap" className="block text-sm font-medium text-navy">
          Shared recap — the member will see this
        </label>
        <textarea
          id="sharedRecap"
          rows={5}
          value={form.sharedRecap}
          onChange={(e) => setForm({ ...form, sharedRecap: e.target.value })}
          className="mt-1 block w-full rounded-lg border border-slate/30 p-2"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-copper">
          {error}
        </p>
      )}
      {saved && !error && <p className="text-sm text-navy">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="min-h-[44px] rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-deep-sea disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save session"}
      </button>
    </form>
  );
}
