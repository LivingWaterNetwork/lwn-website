"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/portal/auth/logout", { method: "POST" });
    } finally {
      router.push("/portal/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm text-navy transition hover:bg-mist focus:outline-none focus:ring-2 focus:ring-lw-blue disabled:opacity-60"
    >
      Sign out
    </button>
  );
}
