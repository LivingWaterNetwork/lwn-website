"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PortalWordmark from "../PortalWordmark";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
      router.push(`/portal/login/verify?email=${encodeURIComponent(email)}`);
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
        <h1 className="font-serif text-2xl text-navy">Welcome back.</h1>
        <p className="mt-2 text-sm text-slate">
          Enter your email and we&apos;ll send you a code to sign in. No password needed.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-navy focus:border-lw-blue focus:outline-none focus:ring-2 focus:ring-lw-blue"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-copper">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || sent}
            className="min-h-[44px] w-full rounded-lg bg-navy px-4 py-2 font-medium text-white transition hover:bg-deep-sea focus:outline-none focus:ring-2 focus:ring-lw-blue disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send me a code"}
          </button>
        </form>
      </div>
      </main>
    </>
  );
}
