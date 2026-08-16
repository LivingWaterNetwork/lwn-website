"use client";

import { useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/yanValidation";

export function YanSubscribeForm({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/yan/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, [HONEYPOT_FIELD]: hp }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return <p className={`text-sm font-yan-body ${dark ? "text-white/70" : "text-yan-navy/60"}`}>You&apos;re on the list — thank you.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-2 ${compact ? "max-w-sm" : "max-w-md"}`}>
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="yan-subscribe-website">Leave this field empty</label>
        <input id="yan-subscribe-website" type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>
      <label htmlFor="yan-subscribe-email" className="sr-only">
        Email address
      </label>
      <input
        id="yan-subscribe-email"
        type="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`flex-1 px-4 py-2.5 rounded-full text-sm font-yan-body focus:outline-none focus:ring-2 focus:ring-yan-blue ${
          dark ? "bg-white/10 border border-white/20 text-white placeholder:text-white/40" : "bg-white border border-yan-navy/15 text-yan-navy"
        }`}
      />
      <button type="submit" disabled={status === "submitting"} className="yan-btn-primary !py-2.5 disabled:opacity-60">
        {status === "submitting" ? "Joining…" : "Get updates"}
      </button>
      {status === "error" && <p className="yan-form-error sm:ml-2">Something went wrong — please try again.</p>}
    </form>
  );
}
