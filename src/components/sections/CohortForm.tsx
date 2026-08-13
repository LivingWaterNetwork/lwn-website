"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type FormState = "idle" | "submitting" | "success" | "error";

export function CohortForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/cohort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="card text-center py-12"
      >
        <div className="text-5xl mb-4">🌊</div>
        <h3 className="font-serif text-2xl font-semibold text-navy mb-2">Application Received!</h3>
        <p className="text-slate text-sm font-sans">
          Thank you for applying. We&apos;ll review your application and reach out within
          a few business days.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="form-label">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="form-input"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label htmlFor="email" className="form-label">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="form-input"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className="form-label">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="form-input"
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div>
          <label htmlFor="role" className="form-label">
            Current Role / Title
          </label>
          <input
            id="role"
            name="role"
            type="text"
            className="form-input"
            placeholder="Pastor, CEO, Marketplace Leader…"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input id="city" name="city" type="text" className="form-input" placeholder="City" />
        </div>
        <div>
          <label htmlFor="state" className="form-label">
            State / Province
          </label>
          <input id="state" name="state" type="text" className="form-input" placeholder="State" />
        </div>
      </div>

      <div>
        <label htmlFor="ministry" className="form-label">
          Church / Organization
        </label>
        <input
          id="ministry"
          name="ministry"
          type="text"
          className="form-input"
          placeholder="Where do you serve or lead?"
        />
      </div>

      <div>
        <label htmlFor="whyJoin" className="form-label">
          Why do you want to join this cohort?{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          id="whyJoin"
          name="whyJoin"
          rows={5}
          required
          className="form-textarea"
          placeholder="Share what has led you to apply and what you hope to gain…"
        />
      </div>

      <div>
        <label htmlFor="referral" className="form-label">
          How did you hear about us?
        </label>
        <input
          id="referral"
          name="referral"
          type="text"
          className="form-input"
          placeholder="Social media, friend, church, etc."
        />
      </div>

      {state === "error" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="form-error text-sm"
        >
          {errorMsg || "Something went wrong. Please try again."}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "submitting" ? "Submitting…" : "Submit Application"}
      </button>

      <p className="text-xs text-slate/55 text-center font-sans">
        Your information is kept private and will only be used to contact you about
        the cohort.
      </p>
    </form>
  );
}
