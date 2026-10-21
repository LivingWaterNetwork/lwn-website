"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewSessionButton({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const res = await fetch(`/api/portal/admin/enrollments/${enrollmentId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) router.push(`/portal/admin/enrollments/${enrollmentId}/sessions/${data.session.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="min-h-[44px] rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-deep-sea disabled:opacity-60"
    >
      {busy ? "Adding…" : "Add session"}
    </button>
  );
}
