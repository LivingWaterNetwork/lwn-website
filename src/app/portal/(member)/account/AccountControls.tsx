"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProgramSwitcher({
  enrollments,
  activeId,
}: {
  enrollments: { id: string; title: string }[];
  activeId: string;
}) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(enrollmentId: string) {
    setError(null);
    setSwitching(true);
    try {
      const res = await fetch("/api/portal/me/active-enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("That didn't switch. Please try again.");
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div>
      <label htmlFor="program-switcher" className="block text-sm font-medium text-navy">
        Program
      </label>
      <select
        id="program-switcher"
        defaultValue={activeId}
        disabled={switching}
        onChange={(e) => handleChange(e.target.value)}
        className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2 text-navy focus:border-lw-blue focus:outline-none focus:ring-2 focus:ring-lw-blue"
      >
        {enrollments.map((e) => (
          <option key={e.id} value={e.id}>
            {e.title}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="mt-1 text-sm text-copper">
          {error}
        </p>
      )}
    </div>
  );
}

export function SignOutEverywhereButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      await fetch("/api/portal/auth/logout-everywhere", { method: "POST" });
    } finally {
      router.push("/portal/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="min-h-[44px] rounded-lg border border-copper px-4 py-2 text-sm font-medium text-copper hover:bg-copper/10 disabled:opacity-60"
    >
      Sign out everywhere
    </button>
  );
}

export function DownloadDataButton() {
  return (
    <a
      href="/api/portal/me/export"
      className="inline-block min-h-[44px] rounded-lg border border-slate/30 px-4 py-2 text-sm font-medium text-navy hover:bg-mist"
    >
      Download my data
    </a>
  );
}
