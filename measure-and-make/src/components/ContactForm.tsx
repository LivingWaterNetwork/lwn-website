"use client";

import { useId, useRef, useState } from "react";
import {
  BUDGET_OPTIONS,
  FIELD_ERRORS,
  HONEYPOT_FIELD,
  INTEREST_OPTIONS,
  ORGANIZATION_TYPES,
  TIMELINE_OPTIONS,
  type ContactResult,
} from "@/lib/contact-schema";
import { contact as copy } from "@/content/copy";
import { apiPath } from "@/lib/asset-path";

type FormState = "idle" | "sending" | ContactResult["status"];

const labelClass = "block font-sans text-sm font-semibold text-forest";
const fieldBase =
  "mt-2 w-full border bg-limestone-light px-4 py-3 font-sans text-base text-forest placeholder:text-field/60";
const hintClass = "mt-2 font-sans text-xs leading-relaxed text-field";

function fieldClass(hasError: boolean) {
  return `${fieldBase} ${
    hasError ? "border-brass-dark" : "border-forest/20 focus:border-forest"
  }`;
}

/**
 * The message the visitor sees comes straight from the server's answer. There
 * is no optimistic or assumed success state anywhere in this component: the
 * thank-you only renders on a confirmed write.
 */
export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const statusRef = useRef<HTMLDivElement>(null);
  const errorId = useId();

  const invalid = (field: string) => invalidFields.includes(field);

  function describedBy(field: string) {
    return invalid(field) ? `${errorId}-${field}` : undefined;
  }

  function FieldError({ field }: { field: string }) {
    if (!invalid(field)) return null;
    return (
      <p
        id={`${errorId}-${field}`}
        className="mt-2 font-sans text-sm text-brass-dark"
      >
        {FIELD_ERRORS[field] ?? "Please check this field."}
      </p>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setState("sending");
    setInvalidFields([]);

    const payload = {
      name: String(data.get("name") ?? ""),
      organization: String(data.get("organization") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      website: String(data.get("website") ?? ""),
      organizationType: String(data.get("organizationType") ?? ""),
      interests: data.getAll("interests").map(String),
      timeline: String(data.get("timeline") ?? ""),
      budget: String(data.get("budget") ?? ""),
      message: String(data.get("message") ?? ""),
      [HONEYPOT_FIELD]: String(data.get(HONEYPOT_FIELD) ?? ""),
    };

    try {
      const response = await fetch(apiPath("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ContactResult;
      setState(result.status);
      if (result.status === "invalid" && result.fields) {
        setInvalidFields(result.fields);
      }
      if (result.status === "ok") form.reset();
    } catch {
      setState("failed");
    }

    // Move attention to the outcome, so a keyboard or screen-reader user is not
    // left guessing whether the submit did anything.
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  if (state === "ok") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="border border-forest/15 bg-limestone-light px-6 py-10 sm:px-8"
      >
        <p className="font-display text-xl text-forest sm:text-2xl">
          {copy.successHeadline}
        </p>
        <p className="mt-4 max-w-prose font-sans text-base leading-relaxed text-field">
          {copy.successBody}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">
            Name{" "}
            <span aria-hidden="true" className="text-brass-dark">
              *
            </span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            aria-invalid={invalid("name") || undefined}
            aria-describedby={describedBy("name")}
            className={fieldClass(invalid("name"))}
          />
          <FieldError field="name" />
        </div>

        <div>
          <label className={labelClass} htmlFor="organization">
            Organization{" "}
            <span aria-hidden="true" className="text-brass-dark">
              *
            </span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="organization"
            name="organization"
            required
            autoComplete="organization"
            aria-invalid={invalid("organization") || undefined}
            aria-describedby={describedBy("organization")}
            className={fieldClass(invalid("organization"))}
          />
          <FieldError field="organization" />
        </div>

        <div>
          <label className={labelClass} htmlFor="email">
            Email{" "}
            <span aria-hidden="true" className="text-brass-dark">
              *
            </span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={invalid("email") || undefined}
            aria-describedby={describedBy("email")}
            className={fieldClass(invalid("email"))}
          />
          <FieldError field="email" />
        </div>

        <div>
          <label className={labelClass} htmlFor="phone">
            Phone <span className="font-normal text-field">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={fieldClass(false)}
          />
        </div>
      </div>

      <div className="mt-6">
        <label className={labelClass} htmlFor="website">
          Website <span className="font-normal text-field">(optional)</span>
        </label>
        <input
          id="website"
          name="website"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="example.org"
          aria-invalid={invalid("website") || undefined}
          aria-describedby={describedBy("website")}
          className={fieldClass(invalid("website"))}
        />
        <FieldError field="website" />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="organizationType">
            What kind of organization are you?
          </label>
          <select
            id="organizationType"
            name="organizationType"
            defaultValue=""
            className={fieldClass(false)}
          >
            <option value="">Select one</option>
            {ORGANIZATION_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="timeline">
            When are you hoping to begin?
          </label>
          <select
            id="timeline"
            name="timeline"
            defaultValue=""
            className={fieldClass(false)}
          >
            <option value="">Select one</option>
            {TIMELINE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className={labelClass}>What are you hoping to work on?</legend>
        <div className="mt-3 space-y-2.5">
          {INTEREST_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-start gap-3 font-sans text-base text-field"
            >
              <input
                type="checkbox"
                name="interests"
                value={option}
                className="mt-1 h-4 w-4 shrink-0 border-forest/30 accent-forest"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <label className={labelClass} htmlFor="budget">
          Budget range
        </label>
        <select
          id="budget"
          name="budget"
          defaultValue=""
          className={`${fieldClass(false)} sm:max-w-xs`}
        >
          <option value="">Select one</option>
          {BUDGET_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <p className={hintClass}>
          A range helps us prepare for the conversation. Scope and pricing are
          set in a written proposal, never here.
        </p>
      </div>

      <div className="mt-6">
        <label className={labelClass} htmlFor="message">
          Project details{" "}
          <span aria-hidden="true" className="text-brass-dark">
            *
          </span>
          <span className="sr-only">(required)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-invalid={invalid("message") || undefined}
          aria-describedby={describedBy("message")}
          className={fieldClass(invalid("message"))}
        />
        <FieldError field="message" />
      </div>

      {/* Honeypot: hidden from real users, left blank by them, filled by bots. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={HONEYPOT_FIELD}>Website</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex w-full items-center justify-center border border-forest bg-forest px-7 py-3.5 font-sans text-sm font-semibold tracking-wide text-limestone transition-colors hover:bg-forest-soft disabled:opacity-60 sm:w-auto"
        >
          {state === "sending" ? copy.sendingLabel : copy.submitLabel}
        </button>
      </div>

      {/* One live region for the form-level outcome. Focused after a submit. */}
      <div
        ref={statusRef}
        tabIndex={-1}
        role="alert"
        aria-live="polite"
        className={state === "idle" || state === "sending" ? "sr-only" : "mt-6"}
      >
        {state === "invalid" ? (
          <p className="max-w-prose font-sans text-sm leading-relaxed text-brass-dark">
            {copy.validationError}
          </p>
        ) : null}

        {state === "rate-limited" ? (
          <p className="max-w-prose font-sans text-sm leading-relaxed text-brass-dark">
            {copy.rateLimitedError}
          </p>
        ) : null}

        {state === "failed" ? (
          <p className="max-w-prose font-sans text-sm leading-relaxed text-brass-dark">
            {copy.submissionError}
          </p>
        ) : null}

        {state === "not-configured" ? (
          <p className="max-w-prose font-sans text-sm leading-relaxed text-brass-dark">
            {copy.notConfiguredError}
          </p>
        ) : null}
      </div>
    </form>
  );
}
