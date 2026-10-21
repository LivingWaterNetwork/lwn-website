"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateOrgForm() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not create the partner org.");
        return;
      }
      setKey("");
      setName("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl bg-mist p-4">
      <div>
        <label htmlFor="orgKey" className="block text-xs font-medium text-slate">
          Key
        </label>
        <input id="orgKey" required value={key} onChange={(e) => setKey(e.target.value)} placeholder="mmg" className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="orgName" className="block text-xs font-medium text-slate">
          Name
        </label>
        <input id="orgName" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm" />
      </div>
      {error && <p className="text-sm text-copper">{error}</p>}
      <button type="submit" disabled={saving} className="min-h-[44px] rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        Create org
      </button>
    </form>
  );
}

export function AddPartnerUserForm({ partnerOrgId }: { partnerOrgId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/admin/partners/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, partnerOrgId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not add the user.");
        return;
      }
      setForm({ email: "", firstName: "", lastName: "" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap items-end gap-2">
      <input
        type="email"
        required
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="min-h-[44px] rounded-lg border border-slate/30 px-2 py-1 text-xs"
      />
      <input
        required
        placeholder="First name"
        value={form.firstName}
        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        className="min-h-[44px] rounded-lg border border-slate/30 px-2 py-1 text-xs"
      />
      <input
        required
        placeholder="Last name"
        value={form.lastName}
        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        className="min-h-[44px] rounded-lg border border-slate/30 px-2 py-1 text-xs"
      />
      {error && <p className="text-xs text-copper">{error}</p>}
      <button type="submit" disabled={saving} className="min-h-[44px] rounded-lg bg-navy px-3 py-1 text-xs font-medium text-white disabled:opacity-60">
        Add user
      </button>
    </form>
  );
}

export function RevokePartnerUserButton({ partnerUserId }: { partnerUserId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      await fetch(`/api/portal/admin/partners/users/${partnerUserId}/revoke`, { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={busy} className="min-h-[44px] rounded-lg border border-copper px-2 py-1 text-xs font-medium text-copper">
      Revoke
    </button>
  );
}
