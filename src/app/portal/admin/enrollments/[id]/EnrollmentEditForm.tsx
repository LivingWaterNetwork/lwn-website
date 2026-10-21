"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MODULES_AVAILABLE } from "@/lib/portal/constants";

export default function EnrollmentEditForm({
  enrollmentId,
  phases,
  currentPhaseKey,
  modules,
  paymentUrl,
  agreementId,
  coaches,
  coachPersonId,
  isAdmin,
}: {
  enrollmentId: string;
  phases: { key: string; title: string }[];
  currentPhaseKey: string | null;
  modules: Record<string, boolean>;
  paymentUrl: string | null;
  agreementId: string | null;
  coaches: { id: string; firstName: string; lastName: string }[];
  coachPersonId: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    currentPhaseKey: currentPhaseKey ?? "",
    paymentUrl: paymentUrl ?? "",
    agreementId: agreementId ?? "",
    coachPersonId: coachPersonId ?? "",
    modules: { ...modules },
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
      const res = await fetch(`/api/portal/admin/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPhaseKey: form.currentPhaseKey || null,
          paymentUrl: form.paymentUrl || null,
          agreementId: form.agreementId || null,
          coachPersonId: isAdmin ? form.coachPersonId || null : undefined,
          modules: form.modules,
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
    <form onSubmit={handleSubmit} className="mt-4 max-w-lg space-y-4 rounded-xl bg-mist p-6">
      <div>
        <label htmlFor="currentPhaseKey" className="block text-sm font-medium text-navy">
          Current phase
        </label>
        <select
          id="currentPhaseKey"
          value={form.currentPhaseKey}
          onChange={(e) => setForm({ ...form, currentPhaseKey: e.target.value })}
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
        >
          <option value="">Auto (by date)</option>
          {phases.map((p) => (
            <option key={p.key} value={p.key}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {isAdmin && (
        <div>
          <label htmlFor="coachPersonId" className="block text-sm font-medium text-navy">
            Coach
          </label>
          <select
            id="coachPersonId"
            value={form.coachPersonId}
            onChange={(e) => setForm({ ...form, coachPersonId: e.target.value })}
            className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
          >
            <option value="">Unassigned</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="agreementId" className="block text-sm font-medium text-navy">
          Linked agreement ID
        </label>
        <input
          id="agreementId"
          value={form.agreementId}
          onChange={(e) => setForm({ ...form, agreementId: e.target.value })}
          placeholder="Paste an Agreement id from /agreements/admin"
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="paymentUrl" className="block text-sm font-medium text-navy">
          Payment link
        </label>
        <input
          id="paymentUrl"
          type="url"
          value={form.paymentUrl}
          onChange={(e) => setForm({ ...form, paymentUrl: e.target.value })}
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-navy">Modules</legend>
        <div className="mt-2 space-y-1">
          {MODULES_AVAILABLE.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={Boolean(form.modules[m])}
                onChange={(e) => setForm({ ...form, modules: { ...form.modules, [m]: e.target.checked } })}
                className="h-5 w-5 rounded border-slate/40"
              />
              {m.replace(/_/g, " ")}
            </label>
          ))}
        </div>
      </fieldset>

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
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
