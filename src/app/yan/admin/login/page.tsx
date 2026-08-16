"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/yan/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Login failed.");
        return;
      }
      router.push(params.get("next") ?? "/yan/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <form onSubmit={handleSubmit} className="w-full max-w-sm yan-card-dark">
        <p className="yan-eyebrow yan-eyebrow-dark mb-2">YAN Admin</p>
        <h1 className="yan-h3 text-white mb-6">Sign in to manage content</h1>
        <label htmlFor="password" className="block text-sm font-yan-body text-white/70 mb-1.5">
          Admin password
        </label>
        <input
          id="password"
          type="password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-white/15 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yan-blue mb-4"
        />
        {error && (
          <p role="alert" className="text-red-300 text-xs mb-4">
            {error}
          </p>
        )}
        <button type="submit" disabled={submitting} className="yan-btn-primary w-full disabled:opacity-60">
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function YanAdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
