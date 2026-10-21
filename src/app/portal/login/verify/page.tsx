"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PortalWordmark from "../../PortalWordmark";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "That code didn't work. Please try again.");
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
    <>
      <PortalWordmark />
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl bg-mist p-8 shadow-sm">
        <h1 className="font-serif text-2xl text-navy">Check your email.</h1>
        <p className="mt-2 text-sm text-slate">
          We sent a 6-digit code to {email || "your email"}. Enter it below — it works for 10 minutes.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-navy">
              6-digit code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1 block w-full min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-center text-2xl tracking-[0.5em] text-navy focus:border-lw-blue focus:outline-none focus:ring-2 focus:ring-lw-blue"
            />
          </div>

          {error && (
            <div role="alert" className="space-y-1 text-sm text-copper">
              <div className="flex items-center justify-between gap-3">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="shrink-0 rounded px-2 py-1 text-xs font-medium underline"
                >
                  Retry
                </button>
              </div>
              <Link href="/portal/login" className="inline-block min-h-[44px] text-xs font-medium underline">
                Get a new code instead
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="min-h-[44px] w-full rounded-lg bg-navy px-4 py-2 font-medium text-white transition hover:bg-deep-sea focus:outline-none focus:ring-2 focus:ring-lw-blue disabled:opacity-60"
          >
            {submitting ? "Checking…" : "Continue"}
          </button>
        </form>
      </div>
      </main>
    </>
  );
}

export default function PortalVerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
