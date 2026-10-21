"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMemberForm({
  templates,
  coaches,
  isAdmin,
}: {
  templates: { key: string; title: string }[];
  coaches: { id: string; firstName: string; lastName: string }[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    templateKey: templates[0]?.key ?? "",
    coachPersonId: "",
    startDate: "",
    endDate: "",
    paymentUrl: "",
    isTest: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          templateKey: form.templateKey,
          coachPersonId: form.coachPersonId || undefined,
          startDate: form.startDate,
          endDate: form.endDate || undefined,
          paymentUrl: form.paymentUrl || undefined,
          isTest: form.isTest,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create the member.");
        return;
      }
      router.push(`/portal/admin/enrollments/${data.enrollmentId}`);
    } catch {
      setError("We couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-navy">
            First name
          </label>
          <input
            id="firstName"
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-navy">
            Last name
          </label>
          <input
            id="lastName"
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="templateKey" className="block text-sm font-medium text-navy">
          Program
        </label>
        <select
          id="templateKey"
          value={form.templateKey}
          onChange={(e) => setForm({ ...form, templateKey: e.target.value })}
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
        >
          {templates.map((t) => (
            <option key={t.key} value={t.key}>
              {t.title}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-navy">
            Start date
          </label>
          <input
            id="startDate"
            type="date"
            required
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-navy">
            End date
          </label>
          <input
            id="endDate"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="paymentUrl" className="block text-sm font-medium text-navy">
          Payment link (optional)
        </label>
        <input
          id="paymentUrl"
          type="url"
          value={form.paymentUrl}
          onChange={(e) => setForm({ ...form, paymentUrl: e.target.value })}
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          checked={form.isTest}
          onChange={(e) => setForm({ ...form, isTest: e.target.checked })}
          className="h-5 w-5 rounded border-slate/40"
        />
        Test record
      </label>

      {error && (
        <p role="alert" className="text-sm text-copper">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="min-h-[44px] rounded-lg bg-navy px-4 py-2 font-medium text-white hover:bg-deep-sea disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Create draft enrollment"}
      </button>
    </form>
  );
}
