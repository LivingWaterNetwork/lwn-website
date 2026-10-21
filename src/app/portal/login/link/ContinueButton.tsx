"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ContinueButton({ token }: { token: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/auth/link-continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "That link didn't work. Please request a new code.");
        return;
      }
      router.push("/portal");
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      {error && (
        <div role="alert" className="space-y-2">
          <p className="text-sm text-copper">{error}</p>
          <Link href="/portal/login" className="inline-block min-h-[44px] text-sm font-medium text-lw-blue underline">
            Get a new sign-in code
          </Link>
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        className="min-h-[44px] w-full rounded-lg bg-navy px-4 py-2 font-medium text-white transition hover:bg-deep-sea focus:outline-none focus:ring-2 focus:ring-lw-blue disabled:opacity-60"
      >
        {submitting ? "Signing you in…" : "Continue"}
      </button>
    </div>
  );
}
