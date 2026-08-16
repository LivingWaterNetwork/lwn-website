"use client";

import { useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/yanValidation";

export function YanLeaderNominateForm() {
  const [form, setForm] = useState({
    name: "",
    ministryName: "",
    role: "",
    bio: "",
    nominatedByName: "",
    nominatedByEmail: "",
    consentGiven: false,
    [HONEYPOT_FIELD]: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/yan/leaders/nominate", {
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
        <h3 className="yan-h3 text-yan-navy mb-2">Thank you for the nomination.</h3>
        <p className="yan-body text-yan-navy/60">We&apos;ll confirm consent with the leader before anything is published.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="yan-card">
      <h3 className="yan-h3 text-yan-navy mb-1">Nominate a leader</h3>
      <p className="text-sm text-yan-navy/50 font-yan-body mb-6">
        We&apos;ll confirm the leader&apos;s consent directly before publishing any spotlight.
      </p>
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="yan-leader-website-hp">Leave this field empty</label>
        <input id="yan-leader-website-hp" type="text" tabIndex={-1} autoComplete="off" value={form[HONEYPOT_FIELD]} onChange={(e) => setForm((f) => ({ ...f, [HONEYPOT_FIELD]: e.target.value }))} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="ln-name" className="yan-form-label">Leader&apos;s name *</label>
          <input id="ln-name" required className="yan-form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="ln-role" className="yan-form-label">Role</label>
          <input id="ln-role" className="yan-form-input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ln-ministry" className="yan-form-label">Ministry / church</label>
          <input id="ln-ministry" className="yan-form-input" value={form.ministryName} onChange={(e) => setForm((f) => ({ ...f, ministryName: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ln-bio" className="yan-form-label">Short bio *</label>
          <textarea id="ln-bio" required rows={3} className="yan-form-textarea" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="ln-your-name" className="yan-form-label">Your name *</label>
          <input id="ln-your-name" required className="yan-form-input" value={form.nominatedByName} onChange={(e) => setForm((f) => ({ ...f, nominatedByName: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="ln-your-email" className="yan-form-label">Your email *</label>
          <input id="ln-your-email" type="email" required className="yan-form-input" value={form.nominatedByEmail} onChange={(e) => setForm((f) => ({ ...f, nominatedByEmail: e.target.value }))} />
        </div>
      </div>
      <label className="inline-flex items-start gap-2 text-sm text-yan-navy/70 mb-4">
        <input type="checkbox" className="mt-1" checked={form.consentGiven} onChange={(e) => setForm((f) => ({ ...f, consentGiven: e.target.checked }))} />
        I confirm this leader has agreed to be featured on the YAN Atlanta website.
      </label>
      {error && <p role="alert" className="yan-form-error mb-4">{error}</p>}
      <button type="submit" disabled={status === "submitting"} className="yan-btn-primary !bg-yan-blue w-full sm:w-auto disabled:opacity-60">
        {status === "submitting" ? "Submitting…" : "Submit nomination"}
      </button>
    </form>
  );
}
