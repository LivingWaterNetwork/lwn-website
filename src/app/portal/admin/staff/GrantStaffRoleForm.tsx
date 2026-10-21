"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GrantStaffRoleForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", role: "coach" as "coach" | "admin" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not grant the role.");
        return;
      }
      setForm({ email: "", firstName: "", lastName: "", role: "coach" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl bg-mist p-4">
      <div>
        <label htmlFor="staffEmail" className="block text-xs font-medium text-slate">
          Email
        </label>
        <input id="staffEmail" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="staffFirst" className="block text-xs font-medium text-slate">
          First name
        </label>
        <input id="staffFirst" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="staffLast" className="block text-xs font-medium text-slate">
          Last name
        </label>
        <input id="staffLast" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="staffRole" className="block text-xs font-medium text-slate">
          Role
        </label>
        <select id="staffRole" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "coach" | "admin" })} className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm">
          <option value="coach">Coach</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {error && <p className="text-sm text-copper">{error}</p>}
      <button type="submit" disabled={saving} className="min-h-[44px] rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {saving ? "Adding…" : "Grant role"}
      </button>
    </form>
  );
}
