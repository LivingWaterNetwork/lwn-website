"use client";

import { useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/yanValidation";
import { track } from "@/lib/yanAnalytics";

export function YanEventRegisterForm({ eventId }: { eventId: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "", organization: "", [HONEYPOT_FIELD]: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "registered" | "waitlisted" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/yan/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, ...form }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus(json.status === "waitlisted" ? "waitlisted" : "registered");
      track("yan_event_registration_completed", { status: json.status });
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "registered" || status === "waitlisted") {
    return (
      <div className="yan-card text-center py-10">
        <h3 className="yan-h3 text-yan-navy mb-2">
          {status === "waitlisted" ? "You're on the waitlist." : "You're registered!"}
        </h3>
        <p className="yan-body text-yan-navy/60">
          {status === "waitlisted"
            ? "The event is currently at capacity — we'll reach out the moment a spot opens up."
            : "A confirmation email is on its way. We can't wait to see you there."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="yan-card">
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="yan-event-website-hp">Leave this field empty</label>
        <input
          id="yan-event-website-hp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form[HONEYPOT_FIELD]}
          onChange={(e) => setForm((f) => ({ ...f, [HONEYPOT_FIELD]: e.target.value }))}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="ev-name" className="yan-form-label">Name *</label>
          <input id="ev-name" required className="yan-form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="ev-email" className="yan-form-label">Email *</label>
          <input id="ev-email" type="email" required className="yan-form-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="ev-phone" className="yan-form-label">Phone</label>
          <input id="ev-phone" className="yan-form-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="ev-role" className="yan-form-label">Your role</label>
          <input id="ev-role" className="yan-form-input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ev-org" className="yan-form-label">Church / organization</label>
          <input id="ev-org" className="yan-form-input" value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} />
        </div>
      </div>
      {error && <p role="alert" className="yan-form-error mb-4">{error}</p>}
      <button type="submit" disabled={status === "submitting"} className="yan-btn-primary !bg-yan-blue w-full disabled:opacity-60">
        {status === "submitting" ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
