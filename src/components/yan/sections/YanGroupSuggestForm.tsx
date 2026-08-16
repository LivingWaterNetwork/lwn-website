"use client";

import { useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/yanValidation";

export function YanGroupSuggestForm({ city = "Atlanta" }: { city?: string }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    groupName: "",
    neighborhood: "",
    meetingDay: "",
    meetingFrequency: "",
    gatheringType: "",
    websiteUrl: "",
    instagramHandle: "",
    description: "",
    [HONEYPOT_FIELD]: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/yan/network/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, city }),
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
        <p className="yan-body text-yan-navy/60">
          Your group has been submitted for review. We&apos;ll be in touch before it&apos;s published.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="yan-card">
      <h3 className="yan-h3 text-yan-navy mb-1">Add your group</h3>
      <p className="text-sm text-yan-navy/50 font-yan-body mb-6">
        Every submission is reviewed by the YAN team before it appears in the directory.
      </p>

      <div className="hp-field" aria-hidden="true">
        <label htmlFor="yan-group-website-hp">Leave this field empty</label>
        <input
          id="yan-group-website-hp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form[HONEYPOT_FIELD]}
          onChange={(e) => setForm((f) => ({ ...f, [HONEYPOT_FIELD]: e.target.value }))}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="g-name" className="yan-form-label">Your name *</label>
          <input id="g-name" required className="yan-form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="g-email" className="yan-form-label">Your email *</label>
          <input id="g-email" type="email" required className="yan-form-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="g-groupname" className="yan-form-label">Group or ministry name *</label>
          <input id="g-groupname" required className="yan-form-input" value={form.groupName} onChange={(e) => setForm((f) => ({ ...f, groupName: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="g-neighborhood" className="yan-form-label">Neighborhood / area</label>
          <input id="g-neighborhood" className="yan-form-input" value={form.neighborhood} onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="g-gatheringtype" className="yan-form-label">Gathering type</label>
          <select id="g-gatheringtype" className="yan-form-input" value={form.gatheringType} onChange={(e) => setForm((f) => ({ ...f, gatheringType: e.target.value }))}>
            <option value="">Select…</option>
            <option value="in-person">In-person</option>
            <option value="hybrid">Hybrid</option>
            <option value="online">Online</option>
          </select>
        </div>
        <div>
          <label htmlFor="g-day" className="yan-form-label">Meeting day</label>
          <input id="g-day" className="yan-form-input" value={form.meetingDay} onChange={(e) => setForm((f) => ({ ...f, meetingDay: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="g-freq" className="yan-form-label">Meeting frequency</label>
          <input id="g-freq" className="yan-form-input" value={form.meetingFrequency} onChange={(e) => setForm((f) => ({ ...f, meetingFrequency: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="g-website" className="yan-form-label">Website</label>
          <input id="g-website" className="yan-form-input" value={form.websiteUrl} onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="g-instagram" className="yan-form-label">Instagram handle</label>
          <input id="g-instagram" className="yan-form-input" value={form.instagramHandle} onChange={(e) => setForm((f) => ({ ...f, instagramHandle: e.target.value }))} />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="g-description" className="yan-form-label">Tell us about your group *</label>
        <textarea id="g-description" required rows={4} className="yan-form-textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>

      <p className="text-xs text-yan-navy/40 mb-4">
        Please share a general area rather than a private residential address — we never publish
        exact meeting locations without your permission.
      </p>

      {error && <p role="alert" className="yan-form-error mb-4">{error}</p>}

      <button type="submit" disabled={status === "submitting"} className="yan-btn-primary !bg-yan-blue w-full sm:w-auto disabled:opacity-60">
        {status === "submitting" ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
