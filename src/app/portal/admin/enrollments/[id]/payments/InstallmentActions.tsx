"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

export default function InstallmentActions({ installmentId }: { installmentId: string }) {
  const router = useRouter();
  const idPrefix = useId();
  const [mode, setMode] = useState<"none" | "paid" | "adjust" | "waive">("none");
  const [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10));
  const [dueOn, setDueOn] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      let body: Record<string, unknown>;
      if (mode === "paid") body = { action: "mark_paid", paidOn, note };
      else if (mode === "adjust") body = { action: "adjust", dueOn, note };
      else body = { action: "waive", note };

      const res = await fetch(`/api/portal/admin/installments/${installmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "That didn't save.");
        return;
      }
      setMode("none");
      setNote("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (mode === "none") {
    return (
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("paid")} className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-xs font-medium text-navy">
          Mark paid
        </button>
        <button type="button" onClick={() => setMode("adjust")} className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-xs font-medium text-navy">
          Adjust
        </button>
        <button type="button" onClick={() => setMode("waive")} className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-xs font-medium text-navy">
          Waive
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-slate/20 p-3">
      {mode === "paid" && (
        <div>
          <label htmlFor={`${idPrefix}-paidOn`} className="block text-xs font-medium text-slate">
            Paid on
          </label>
          <input
            id={`${idPrefix}-paidOn`}
            type="date"
            value={paidOn}
            onChange={(e) => setPaidOn(e.target.value)}
            className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-2 py-1 text-sm"
          />
        </div>
      )}
      {mode === "adjust" && (
        <div>
          <label htmlFor={`${idPrefix}-dueOn`} className="block text-xs font-medium text-slate">
            New due date
          </label>
          <input
            id={`${idPrefix}-dueOn`}
            type="date"
            value={dueOn}
            onChange={(e) => setDueOn(e.target.value)}
            className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-2 py-1 text-sm"
          />
        </div>
      )}
      <div>
        <label htmlFor={`${idPrefix}-note`} className="block text-xs font-medium text-slate">
          Note {mode !== "paid" && "(required)"}
        </label>
        <input
          id={`${idPrefix}-note`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Bluevine"
          className="mt-1 min-h-[44px] w-full rounded-lg border border-slate/30 px-2 py-1 text-sm"
        />
      </div>
      {error && <p className="text-xs text-copper">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy || (mode !== "paid" && !note.trim()) || (mode === "adjust" && !dueOn)}
          className="min-h-[44px] rounded-lg bg-navy px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
        >
          Save
        </button>
        <button type="button" onClick={() => setMode("none")} className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-xs text-navy">
          Cancel
        </button>
      </div>
    </div>
  );
}
