"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RevokeRoleButton({ roleId }: { roleId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      await fetch(`/api/portal/admin/staff/${roleId}/revoke`, { method: "POST" });
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
      className="min-h-[44px] rounded-lg border border-copper px-3 py-2 text-xs font-medium text-copper"
    >
      Revoke
    </button>
  );
}
