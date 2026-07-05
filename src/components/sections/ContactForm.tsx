"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

type ContactFormProps = {
  subject?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
};

export function ContactForm({
  subject,
  messagePlaceholder = "How can we help you?",
  submitLabel = "Send Message",
  successTitle = "Message Sent!",
  successBody = "Thank you for reaching out. We'll be in touch soon.",
}: ContactFormProps = {}) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
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
      <div className="card text-center py-10">
        <div className="text-4xl mb-3">✉️</div>
        <h3 className="font-serif text-xl font-semibold text-navy mb-2">{successTitle}</h3>
        <p className="text-slate text-sm font-sans">{successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {subject && <input type="hidden" name="subject" value={subject} />}
      <div>
        <label htmlFor="name" className="form-label">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="form-input"
          placeholder="Your name"
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
      <div>
        <label htmlFor="message" className="form-label">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="form-textarea"
          placeholder={messagePlaceholder}
        />
      </div>

      {state === "error" && (
        <p className="form-error">{errorMsg || "Something went wrong. Please try again."}</p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "submitting" ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
