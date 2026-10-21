"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function InviteButton({ enrollmentId, disabledReason }: { enrollmentId: string; disabledReason?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/portal/admin/enrollments/${enrollmentId}/invite`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not send the invite.");
        return;
      }
      setMessage("Sign-in email sent.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="min-h-[44px] rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-deep-sea disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send sign-in email"}
      </button>
      {disabledReason && <p className="mt-1 text-xs text-slate">{disabledReason}</p>}
      {message && <p className="mt-1 text-xs text-navy">{message}</p>}
    </div>
  );
}

export function StatusActions({ enrollmentId, status }: { enrollmentId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(next: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/admin/enrollments/${enrollmentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "That didn't work.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(status === "draft" || status === "invited") && (
        <button
          type="button"
          disabled={busy}
          onClick={() => setStatus("active")}
          className="min-h-[44px] rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white hover:bg-deep-sea"
        >
          Activate
        </button>
      )}
      {status === "active" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => setStatus("paused")}
          className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm text-navy"
        >
          Pause
        </button>
      )}
      {status === "paused" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => setStatus("active")}
          className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm text-navy"
        >
          Resume
        </button>
      )}
      {status !== "completed" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => setStatus("completed")}
          className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm text-navy"
        >
          Mark completed
        </button>
      )}
      {status !== "archived" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => setStatus("archived")}
          className="min-h-[44px] rounded-lg border border-copper px-3 py-2 text-sm text-copper"
        >
          Archive
        </button>
      )}
      {error && (
        <p role="alert" className="text-sm text-copper">
          {error}
        </p>
      )}
    </div>
  );
}
