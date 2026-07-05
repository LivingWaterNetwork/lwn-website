"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function NewsletterSignup({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p className={`text-sm font-sans ${dark ? "text-spring" : "text-copper"}`}>
        You&apos;re in! Watch your inbox for updates from Living Water Network.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={
          dark
            ? "flex-1 px-4 py-2.5 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-spring"
            : "flex-1 px-4 py-2.5 rounded-md border border-mist bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-[#0A77BC]"
        }
      />
      <button
        type="submit"
        disabled={state === "submitting"}
        className="btn-copper whitespace-nowrap disabled:opacity-60"
      >
        {state === "submitting" ? "Subscribing…" : "Subscribe"}
      </button>
      {state === "error" && (
        <p className="text-red-400 text-xs font-sans mt-1 sm:mt-0 sm:ml-2 self-center">
          Something went wrong — try again.
        </p>
      )}
    </form>
  );
}
