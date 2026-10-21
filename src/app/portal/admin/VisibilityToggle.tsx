"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VisibilityToggle({ documentId, visibleToMember }: { documentId: string; visibleToMember: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      await fetch(`/api/portal/admin/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibleToMember: !visibleToMember }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-xs font-medium text-navy"
    >
      {visibleToMember ? "Visible to member" : "Hidden from member"}
    </button>
  );
}
