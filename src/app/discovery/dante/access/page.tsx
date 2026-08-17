"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AccessForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/discovery/dante/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "That didn't work.");
        return;
      }
      router.push(params.get("next") ?? "/discovery/dante");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-navy">
      <form onSubmit={handleSubmit} className="w-full max-w-sm card">
        <p className="section-label mb-2">Just for Dante</p>
        <h1 className="font-serif text-2xl font-semibold text-navy mb-2">This one&apos;s private</h1>
        <p className="text-slate text-sm font-sans mb-6">
          Enter the code from the message where this link was shared with you.
        </p>
        <label htmlFor="code" className="form-label">
          Access code
        </label>
        <input
          id="code"
          type="password"
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="form-input mb-4"
        />
        {error && (
          <p role="alert" className="form-error mb-4">
            {error}
          </p>
        )}
        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
          {submitting ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

export default function DanteDiscoveryAccessPage() {
  return (
    <Suspense fallback={null}>
      <AccessForm />
    </Suspense>
  );
}
