"use client";

import { useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/yanValidation";
import { track } from "@/lib/yanAnalytics";

export function YanPrayerRequestForm() {
  const [form, setForm] = useState({
    requestText: "",
    name: "",
    email: "",
    visibility: "private" as "private" | "anonymous-public",
    allowFollowUp: false,
    [HONEYPOT_FIELD]: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/yan/pray/request", {
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
      track("yan_prayer_request_submitted", { visibility: form.visibility });
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="yan-card text-center py-10">
        <h3 className="yan-h3 text-yan-navy mb-2">Your request has been received.</h3>
        <p className="yan-body text-yan-navy/60">The YAN prayer team will be praying with you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="yan-card">
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="yan-pray-website-hp">Leave this field empty</label>
        <input id="yan-pray-website-hp" type="text" tabIndex={-1} autoComplete="off" value={form[HONEYPOT_FIELD]} onChange={(e) => setForm((f) => ({ ...f, [HONEYPOT_FIELD]: e.target.value }))} />
      </div>
      <div className="mb-4">
        <label htmlFor="pray-text" className="yan-form-label">Your prayer request *</label>
        <textarea
          id="pray-text"
          required
          rows={5}
          className="yan-form-textarea"
          value={form.requestText}
          onChange={(e) => setForm((f) => ({ ...f, requestText: e.target.value }))}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="pray-name" className="yan-form-label">Name (optional)</label>
          <input id="pray-name" className="yan-form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="pray-email" className="yan-form-label">Email (optional)</label>
          <input id="pray-email" type="email" className="yan-form-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
      </div>
      <fieldset className="mb-4">
        <legend className="yan-form-label mb-1.5">How should this be handled?</legend>
        <label className="flex items-start gap-2 text-sm text-yan-navy/70 mb-2">
          <input
            type="radio"
            name="visibility"
            checked={form.visibility === "private"}
            onChange={() => setForm((f) => ({ ...f, visibility: "private" }))}
          />
          Keep this private — seen only by the YAN prayer team.
        </label>
        <label className="flex items-start gap-2 text-sm text-yan-navy/70">
          <input
            type="radio"
            name="visibility"
            checked={form.visibility === "anonymous-public"}
            onChange={() => setForm((f) => ({ ...f, visibility: "anonymous-public" }))}
          />
          Consider sharing anonymously on the city prayer wall, if approved.
        </label>
      </fieldset>
      <label className="flex items-start gap-2 text-sm text-yan-navy/70 mb-4">
        <input type="checkbox" checked={form.allowFollowUp} onChange={(e) => setForm((f) => ({ ...f, allowFollowUp: e.target.checked }))} />
        A member of the team may follow up with me directly.
      </label>

      {error && <p role="alert" className="yan-form-error mb-4">{error}</p>}

      <p className="text-xs text-yan-navy/40 mb-4">
        This form is not a substitute for emergency services or professional care. If you are in
        crisis, please call or text 988 (Suicide &amp; Crisis Lifeline) or call 911.
      </p>

      <button type="submit" disabled={status === "submitting"} className="yan-btn-primary !bg-yan-blue w-full disabled:opacity-60">
        {status === "submitting" ? "Submitting…" : "Submit prayer request"}
      </button>
    </form>
  );
}
