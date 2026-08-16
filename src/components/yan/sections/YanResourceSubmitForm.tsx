"use client";

import { useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/yanValidation";

const TYPES = ["leader-tool", "curriculum", "prayer-guide", "event-kit", "reading", "training", "opportunity"];

export function YanResourceSubmitForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    resourceType: "leader-tool",
    description: "",
    externalUrl: "",
    [HONEYPOT_FIELD]: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/yan/resources/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="yan-card text-center py-10">
        <h3 className="yan-h3 text-yan-navy mb-2">Thank you!</h3>
        <p className="yan-body text-yan-navy/60">Your resource has been submitted for review.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="yan-card">
      <h3 className="yan-h3 text-yan-navy mb-6">Submit a resource</h3>
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="yan-resource-website-hp">Leave this field empty</label>
        <input id="yan-resource-website-hp" type="text" tabIndex={-1} autoComplete="off" value={form[HONEYPOT_FIELD]} onChange={(e) => setForm((f) => ({ ...f, [HONEYPOT_FIELD]: e.target.value }))} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="res-name" className="yan-form-label">Your name *</label>
          <input id="res-name" required className="yan-form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="res-email" className="yan-form-label">Your email *</label>
          <input id="res-email" type="email" required className="yan-form-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="res-title" className="yan-form-label">Resource title *</label>
          <input id="res-title" required className="yan-form-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="res-type" className="yan-form-label">Type *</label>
          <select id="res-type" className="yan-form-input" value={form.resourceType} onChange={(e) => setForm((f) => ({ ...f, resourceType: e.target.value }))}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/-/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="res-url" className="yan-form-label">Link (optional)</label>
          <input id="res-url" className="yan-form-input" value={form.externalUrl} onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="res-description" className="yan-form-label">Description *</label>
          <textarea id="res-description" required rows={4} className="yan-form-textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
      </div>
      {error && <p role="alert" className="yan-form-error mb-4">{error}</p>}
      <button type="submit" disabled={status === "submitting"} className="yan-btn-primary !bg-yan-blue w-full sm:w-auto disabled:opacity-60">
        {status === "submitting" ? "Submitting…" : "Submit resource"}
      </button>
    </form>
  );
}
