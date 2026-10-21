"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PrivateNotes({
  sessionId,
  notes,
}: {
  sessionId: string;
  notes: { id: string; body: string; createdAt: string }[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/admin/sessions/${sessionId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "That didn't save.");
        return;
      }
      setDraft("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border-2 border-dashed border-copper/40 bg-copper/5 p-6">
      <h3 className="font-serif text-lg text-navy">Private — only LWN coaches see this</h3>
      <ul className="mt-3 space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="rounded-lg bg-white p-3 text-sm text-navy">
            <p>{n.body}</p>
            <p className="mt-1 text-xs text-slate">{new Date(n.createdAt).toLocaleString()}</p>
          </li>
        ))}
        {notes.length === 0 && <p className="text-sm text-slate">No private notes yet.</p>}
      </ul>

      <form onSubmit={handleSubmit} className="mt-3">
        <label htmlFor="privateNote" className="sr-only">
          Add a private note
        </label>
        <textarea
          id="privateNote"
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Only coaches and admins can ever see this."
          className="block w-full rounded-lg border border-slate/30 p-2 text-sm"
        />
        {error && (
          <p role="alert" className="mt-1 text-sm text-copper">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="mt-2 min-h-[44px] rounded-lg border border-copper px-3 py-2 text-sm font-medium text-copper disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add private note"}
        </button>
      </form>
    </section>
  );
}
