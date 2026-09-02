"use client";

import { useState } from "react";
import {
  HONEYPOT_FIELD,
  INTEREST_OPTIONS,
  ORGANIZATION_TYPES,
  type ContactResult,
} from "@/lib/contact-schema";
import { contact as copy } from "@/content/copy";

const labelClass =
  "block font-sans text-sm font-semibold text-forest";
const fieldClass =
  "mt-2 w-full border border-forest/20 bg-limestone-light px-4 py-3 font-sans text-base text-forest placeholder:text-field/60 focus:border-forest";

/**
 * Client-side state only. Every value is validated again on the server, and the
 * message the visitor sees comes straight from the server's answer — there is no
 * optimistic or assumed success state anywhere in this component.
 */
export function ContactForm({ contactEmail }: { contactEmail: string }) {
  const [state, setState] = useState<"idle" | "sending" | ContactResult["status"]>(
    "idle",
  );
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

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
      organizationType: String(data.get("organizationType") ?? ""),
      interests: data.getAll("interests").map(String),
      message: String(data.get("message") ?? ""),
      [HONEYPOT_FIELD]: String(data.get(HONEYPOT_FIELD) ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
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
  }

  if (state === "ok") {
    return (
      <div
        role="status"
        className="border border-forest/15 bg-limestone-light px-6 py-10"
      >
        <p className="font-display text-xl text-forest">
          Thank you — we&rsquo;ve received your message and will follow up soon.
        </p>
      </div>
    );
  }

  const invalid = (field: string) => invalidFields.includes(field);

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">
            Name <span className="text-brass-dark">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            aria-invalid={invalid("name")}
            className={`${fieldClass} ${invalid("name") ? "border-brass-dark" : ""}`}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="organization">
            Organization <span className="text-brass-dark">*</span>
          </label>
          <input
            id="organization"
            name="organization"
            required
            autoComplete="organization"
            aria-invalid={invalid("organization")}
            className={`${fieldClass} ${invalid("organization") ? "border-brass-dark" : ""}`}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="email">
            Email <span className="text-brass-dark">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={invalid("email")}
            className={`${fieldClass} ${invalid("email") ? "border-brass-dark" : ""}`}
          />
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
            className={fieldClass}
          />
        </div>
      </div>

      <div className="mt-6">
        <label className={labelClass} htmlFor="organizationType">
          What kind of organization are you?
        </label>
        <select
          id="organizationType"
          name="organizationType"
          defaultValue=""
          className={fieldClass}
        >
          <option value="">Select one</option>
          {ORGANIZATION_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="mt-6">
        <legend className={labelClass}>What are you hoping to work on?</legend>
        <div className="mt-3 space-y-2">
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
        <label className={labelClass} htmlFor="message">
          Tell us more <span className="font-normal text-field">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          className={fieldClass}
        />
      </div>

      {/* Honeypot: hidden from real users, left blank by them, filled by bots. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={HONEYPOT_FIELD}>Website</label>
        <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex items-center justify-center border border-forest bg-forest px-7 py-3.5 font-sans text-sm font-semibold tracking-wide text-limestone transition-colors hover:bg-forest-soft disabled:opacity-60"
        >
          {state === "sending" ? "Just a moment." : copy.submitLabel}
        </button>
      </div>

      {state === "invalid" ? (
        <p role="alert" className="mt-5 font-sans text-sm text-brass-dark">
          {copy.validationError}
        </p>
      ) : null}

      {state === "rate-limited" ? (
        <p role="alert" className="mt-5 max-w-prose font-sans text-sm text-brass-dark">
          That&rsquo;s several messages from this connection in a short window, so
          this one wasn&rsquo;t sent. Please try again shortly, or email us
          directly at{" "}
          <a className="underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          .
        </p>
      ) : null}

      {state === "failed" ? (
        <p role="alert" className="mt-5 max-w-prose font-sans text-sm text-brass-dark">
          Something went wrong on our end. Please try again, or reach us directly
          at{" "}
          <a className="underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          .
        </p>
      ) : null}

      {state === "not-configured" ? (
        <p role="alert" className="mt-5 max-w-prose font-sans text-sm text-brass-dark">
          This form isn&rsquo;t connected to its inbox in this environment yet, so
          your message was not sent and nothing was saved. Please email us
          directly at{" "}
          <a className="underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          .
        </p>
      ) : null}
    </form>
  );
}
