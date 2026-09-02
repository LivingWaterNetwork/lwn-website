"use client";

import { useRef, useState } from "react";
import { CATALYST_CAPABILITIES } from "@/lib/catalystContent";

type FormState = "idle" | "submitting" | "success" | "error";

const ORG_TYPES = [
  "Church or ministry team",
  "Nonprofit organization",
  "Faith-based organization",
  "Small or growing business",
  "Community initiative",
  "Individual or entrepreneur",
  "Other",
];

const PROJECT_STAGES = [
  "Just an idea so far",
  "Clear vision, no plan yet",
  "Plan in place, nothing built",
  "Something exists and needs rebuilding",
  "Something exists and needs extending",
];

const TIMELINES = [
  "As soon as possible",
  "Within 1–3 months",
  "Within 3–6 months",
  "6+ months out",
  "Still exploring",
];

const BUDGET_RANGES = [
  "Not determined yet",
  "Under $5,000",
  "$5,000 – $15,000",
  "$15,000 – $40,000",
  "$40,000+",
  "Prefer to discuss",
];

export function CatalystInquiryForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries()) as Record<string, string>;

    // Checkbox groups arrive as repeated keys — collect them separately.
    const services = formData.getAll("services").map(String).join(", ");

    const body = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      organization: values.organization,
      currentWebsite: values.currentWebsite,
      orgType: values.orgType,
      building: values.building,
      problem: values.problem,
      services,
      projectStage: values.projectStage,
      timeline: values.timeline,
      budgetRange: values.budgetRange,
      referral: values.referral,
      additional: values.additional,
      website: values.website, // honeypot
    };

    try {
      const res = await fetch("/api/catalyst/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }
      setState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
      // Move focus to the error so screen-reader and keyboard users hear it.
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  if (state === "success") {
    return (
      <div className="cat-panel text-center py-14" role="status">
        <h2 className="cat-h2 text-navy">Thank you — we&apos;ve got it.</h2>
        <p className="cat-body mt-4 max-w-md mx-auto">
          Your inquiry has been received. We&apos;ll review what you shared and follow up by
          email to set up a discovery conversation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="cat-panel space-y-10" noValidate={false}>
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Leave this field blank</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* ── About you ─────────────────────────────────────────────────── */}
      <fieldset className="space-y-5">
        <legend className="cat-eyebrow mb-4">About you</legend>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="form-label">
              Full name <span className="text-red-600" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input id="name" name="name" type="text" required autoComplete="name" className="form-input" />
          </div>
          <div>
            <label htmlFor="email" className="form-label">
              Email <span className="text-red-600" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" className="form-input" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="phone" className="form-label">
              Phone <span className="font-normal text-slate/70">(optional)</span>
            </label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" className="form-input" />
          </div>
          <div>
            <label htmlFor="organization" className="form-label">
              Organization
            </label>
            <input id="organization" name="organization" type="text" autoComplete="organization" className="form-input" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="currentWebsite" className="form-label">
              Current website
            </label>
            <input
              id="currentWebsite"
              name="currentWebsite"
              type="text"
              inputMode="url"
              placeholder="example.org"
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="orgType" className="form-label">
              Organization type
            </label>
            <select id="orgType" name="orgType" defaultValue="" className="form-input">
              <option value="">Select one</option>
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* ── The work ──────────────────────────────────────────────────── */}
      <fieldset className="space-y-5 pt-8 cat-rule">
        <legend className="cat-eyebrow mb-4">The work</legend>

        <div>
          <label htmlFor="building" className="form-label">
            What are you building? <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <textarea
            id="building"
            name="building"
            rows={5}
            required
            className="form-textarea"
            aria-describedby="building-help"
          />
          <p id="building-help" className="text-xs text-slate/70 mt-1.5 font-sans">
            The organization, initiative, or project — in your own words.
          </p>
        </div>

        <div>
          <label htmlFor="problem" className="form-label">
            What problem are you trying to solve?
          </label>
          <textarea
            id="problem"
            name="problem"
            rows={5}
            className="form-textarea"
            aria-describedby="problem-help"
          />
          <p id="problem-help" className="text-xs text-slate/70 mt-1.5 font-sans">
            What&apos;s getting in the way right now, or what keeps breaking.
          </p>
        </div>

        <fieldset>
          <legend className="form-label">Services of interest</legend>
          <p className="text-xs text-slate/70 mb-3 font-sans">Select any that apply.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {CATALYST_CAPABILITIES.map((capability) => (
              <label
                key={capability.id}
                htmlFor={`service-${capability.id}`}
                className="flex items-start gap-3 rounded-md border border-navy/12 px-4 py-3 cursor-pointer transition-colors hover:border-navy/30 focus-within:ring-2 focus-within:ring-[#0A77BC] focus-within:ring-offset-2"
              >
                <input
                  id={`service-${capability.id}`}
                  name="services"
                  type="checkbox"
                  value={capability.title}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#0A77BC]"
                />
                <span className="font-sans text-sm text-navy">{capability.title}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      {/* ── Scope ─────────────────────────────────────────────────────── */}
      <fieldset className="space-y-5 pt-8 cat-rule">
        <legend className="cat-eyebrow mb-4">Scope</legend>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="projectStage" className="form-label">
              Project stage
            </label>
            <select id="projectStage" name="projectStage" defaultValue="" className="form-input">
              <option value="">Select one</option>
              {PROJECT_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="timeline" className="form-label">
              Timeline
            </label>
            <select id="timeline" name="timeline" defaultValue="" className="form-input">
              <option value="">Select one</option>
              {TIMELINES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="budgetRange" className="form-label">
              Budget range
            </label>
            <select id="budgetRange" name="budgetRange" defaultValue="" className="form-input">
              <option value="">Select one</option>
              {BUDGET_RANGES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="referral" className="form-label">
              How did you hear about us?
            </label>
            <input id="referral" name="referral" type="text" className="form-input" />
          </div>
        </div>

        <div>
          <label htmlFor="additional" className="form-label">
            Anything else we should know?
          </label>
          <textarea id="additional" name="additional" rows={4} className="form-textarea" />
        </div>
      </fieldset>

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <div className="pt-8 cat-rule space-y-5">
        {state === "error" && (
          <p
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="form-error text-sm rounded-md border border-red-200 bg-red-50 px-4 py-3"
          >
            {errorMsg || "Something went wrong. Please try again."}
          </p>
        )}

        <button
          type="submit"
          disabled={state === "submitting"}
          className="btn-copper w-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state === "submitting" ? "Sending…" : "Send Inquiry"}
        </button>

        <p className="text-xs text-slate/70 font-sans leading-relaxed">
          By submitting this form you agree that we may contact you about your inquiry. Your
          information is used only to respond to this request and is never sold or shared. See
          our{" "}
          <a href="/privacy" className="text-[#0A77BC] underline hover:text-deep-sea">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </form>
  );
}
