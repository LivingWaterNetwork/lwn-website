"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

export interface AgreementCandidate {
  id: string;
  slug: string;
  status: string;
  templateTitle: string;
  participantName: string;
  participantEmail: string;
}

export default function AgreementPicker({
  enrollmentId,
  defaultEmail,
  current,
}: {
  enrollmentId: string;
  defaultEmail: string;
  current: AgreementCandidate | null;
}) {
  const router = useRouter();
  const emailId = useId();
  const [email, setEmail] = useState(defaultEmail);
  const [candidates, setCandidates] = useState<AgreementCandidate[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/portal/admin/enrollments/${enrollmentId}/agreement-candidates?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not search.");
        return;
      }
      setCandidates(data.candidates);
    } catch {
      setError("We couldn't reach the server.");
    } finally {
      setSearching(false);
    }
  }

  async function link(agreementId: string | null) {
    setLinking(agreementId ?? "none");
    setError(null);
    try {
      const res = await fetch(`/api/portal/admin/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agreementId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not link that agreement.");
        return;
      }
      setCandidates(null);
      router.refresh();
    } catch {
      setError("We couldn't reach the server.");
    } finally {
      setLinking(null);
    }
  }

  return (
    <section className="mt-6 rounded-xl bg-mist p-6">
      <h3 className="font-serif text-lg text-navy">Linked agreement</h3>

      {current ? (
        <div className="mt-2 flex items-center justify-between rounded-lg bg-white p-3">
          <div>
            <p className="text-sm font-medium text-navy">
              {current.templateTitle} — <span className="capitalize">{current.status}</span>
            </p>
            <p className="text-xs text-slate">
              {current.participantName} ({current.participantEmail}) · {current.slug}
            </p>
          </div>
          <button
            type="button"
            onClick={() => link(null)}
            disabled={linking !== null}
            className="min-h-[44px] rounded-lg border border-copper px-3 py-2 text-xs font-medium text-copper disabled:opacity-60"
          >
            Unlink
          </button>
        </div>
      ) : (
        <p className="mt-1 text-sm text-slate">No agreement linked yet.</p>
      )}

      <form onSubmit={search} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={emailId} className="block text-xs font-medium text-slate">
            Search by participant email
          </label>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={searching || !email.trim()}
          className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm text-navy disabled:opacity-60"
        >
          {searching ? "Searching…" : "Search Agreements"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-2 text-sm text-copper">
          {error}
        </p>
      )}

      {candidates !== null && (
        <ul className="mt-3 space-y-2">
          {candidates.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-lg bg-white p-3">
              <div>
                <p className="text-sm font-medium text-navy">
                  {c.templateTitle} — <span className="capitalize">{c.status}</span>
                </p>
                <p className="text-xs text-slate">
                  {c.participantName} ({c.participantEmail}) · {c.slug}
                </p>
              </div>
              <button
                type="button"
                onClick={() => link(c.id)}
                disabled={linking !== null || c.id === current?.id}
                className="min-h-[44px] rounded-lg bg-navy px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
              >
                {c.id === current?.id ? "Linked" : linking === c.id ? "Linking…" : "Link"}
              </button>
            </li>
          ))}
          {candidates.length === 0 && (
            <p className="text-sm text-slate">No non-voided Agreements found for that email.</p>
          )}
        </ul>
      )}
    </section>
  );
}
