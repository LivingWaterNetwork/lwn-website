"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PartnerGrants({
  enrollmentId,
  orgs,
  grants,
}: {
  enrollmentId: string;
  orgs: { id: string; name: string }[];
  grants: { id: string; partnerOrgId: string; grantedVia: string }[];
}) {
  const router = useRouter();
  const [partnerOrgId, setPartnerOrgId] = useState(orgs[0]?.id ?? "");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/admin/enrollments/${enrollmentId}/grants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerOrgId, modules: ["brand_website"], memberConsentConfirmed: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not grant access.");
        return;
      }
      setConsent(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke(grantId: string) {
    setSaving(true);
    try {
      await fetch(`/api/portal/admin/grants/${grantId}/revoke`, { method: "POST" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-6 rounded-xl bg-mist p-6">
      <h3 className="font-serif text-lg text-navy">Partner access</h3>
      <p className="mt-1 text-xs text-slate">
        Brand & website materials only. Never reflections, stewardship, payments, recaps, or private notes.
      </p>

      <ul className="mt-3 space-y-1">
        {grants.map((g) => (
          <li key={g.id} className="flex items-center justify-between text-sm text-navy">
            <span>
              {orgs.find((o) => o.id === g.partnerOrgId)?.name ?? g.partnerOrgId} ({g.grantedVia.replace(/_/g, " ")})
            </span>
            <button type="button" onClick={() => handleRevoke(g.id)} disabled={saving} className="min-h-[44px] rounded-lg border border-copper px-2 py-1 text-xs text-copper">
              Revoke
            </button>
          </li>
        ))}
        {grants.length === 0 && <p className="text-sm text-slate">No active grants.</p>}
      </ul>

      {orgs.length > 0 && (
        <form onSubmit={handleGrant} className="mt-3 space-y-2">
          <select value={partnerOrgId} onChange={(e) => setPartnerOrgId(e.target.value)} className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm">
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-5 w-5 rounded border-slate/40" />
            The member gave written OK to share brand/website items with this partner
          </label>
          {error && <p className="text-sm text-copper">{error}</p>}
          <button type="submit" disabled={saving || !consent} className="min-h-[44px] rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            Grant access
          </button>
        </form>
      )}
    </section>
  );
}
