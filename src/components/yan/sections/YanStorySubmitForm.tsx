"use client";

import { useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/yanValidation";
import { track } from "@/lib/yanAnalytics";

const TYPES = ["testimony", "movement-moment", "event-recap", "collaboration"];

export function YanStorySubmitForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    storyType: "testimony",
    body: "",
    consentGiven: false,
    [HONEYPOT_FIELD]: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/yan/stories/submit", {
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
      track("yan_story_submission_completed");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="yan-card text-center py-10">
        <h3 className="yan-h3 text-yan-navy mb-2">Thank you for sharing.</h3>
        <p className="yan-body text-yan-navy/60">Your story will be reviewed before it&apos;s published.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="yan-card"
      onFocus={() => {
        if (!started) {
          setStarted(true);
          track("yan_story_submission_started");
        }
      }}
    >
      <h3 className="yan-h3 text-yan-navy mb-6">Share a story</h3>
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="yan-story-website-hp">Leave this field empty</label>
        <input id="yan-story-website-hp" type="text" tabIndex={-1} autoComplete="off" value={form[HONEYPOT_FIELD]} onChange={(e) => setForm((f) => ({ ...f, [HONEYPOT_FIELD]: e.target.value }))} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="story-name" className="yan-form-label">Your name *</label>
          <input id="story-name" required className="yan-form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="story-email" className="yan-form-label">Your email *</label>
          <input id="story-email" type="email" required className="yan-form-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="story-title" className="yan-form-label">Title *</label>
          <input id="story-title" required className="yan-form-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="story-type" className="yan-form-label">Story type *</label>
          <select id="story-type" className="yan-form-input" value={form.storyType} onChange={(e) => setForm((f) => ({ ...f, storyType: e.target.value }))}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/-/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="story-body" className="yan-form-label">Your story *</label>
        <textarea id="story-body" required rows={6} className="yan-form-textarea" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
      </div>
      <label className="flex items-start gap-2 text-sm text-yan-navy/70 mb-4">
        <input type="checkbox" checked={form.consentGiven} onChange={(e) => setForm((f) => ({ ...f, consentGiven: e.target.checked }))} />
        I consent to this story being published on the YAN Atlanta website, with my name attached.
      </label>
      {error && <p role="alert" className="yan-form-error mb-4">{error}</p>}
      <button type="submit" disabled={status === "submitting"} className="yan-btn-primary !bg-yan-blue w-full sm:w-auto disabled:opacity-60">
        {status === "submitting" ? "Submitting…" : "Submit story"}
      </button>
    </form>
  );
}
