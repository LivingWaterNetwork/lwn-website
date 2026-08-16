"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type FormState = "idle" | "submitting" | "success" | "error";

type SelectField = {
  type: "select";
  id: string;
  label: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
};

type TextField = {
  type: "text";
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
};

type TextareaField = {
  type: "textarea";
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
};

export type ProgramField = SelectField | TextField | TextareaField;

type ProgramInquiryFormProps = {
  program: "counseling" | "mentorship" | "speaking" | "missions" | "coaching" | "church-advisory";
  fields: ProgramField[];
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
  disclaimer?: string;
};

// Builds a human-readable "details" block from the program's field
// definitions and the submitted values. This used to be passed in as a
// `detailsBuilder` function prop from each server-component page, but
// functions can't be serialized across the server/client boundary in the
// App Router — that caused every one of these pages to throw at request
// time in production ("Functions cannot be passed directly to Client
// Components"). Building the string here instead, from plain data, fixes
// that for good.
function buildDetails(fields: ProgramField[], values: Record<string, string>) {
  return fields
    .map((field) => {
      if (field.type === "select") {
        const selected = field.options.find((opt) => opt.value === values[field.id]);
        return `${field.label}: ${selected?.label ?? values[field.id] ?? "—"}`;
      }
      return `${field.label}:\n${values[field.id] || "—"}`;
    })
    .join("\n\n");
}

export function ProgramInquiryForm({
  program,
  fields,
  submitLabel = "Submit Inquiry",
  successTitle = "Thank You!",
  successBody = "We've received your inquiry and will be in touch soon.",
  disclaimer,
}: ProgramInquiryFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries()) as Record<string, string>;

    const details = buildDetails(fields, values);

    const body = {
      program,
      name: values.name,
      email: values.email,
      phone: values.phone,
      details,
      website: values.website, // honeypot
    };

    try {
      const res = await fetch("/api/programs/inquire", {
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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="card text-center py-12"
      >
        <div className="text-5xl mb-4">🌊</div>
        <h3 className="font-serif text-2xl font-semibold text-navy mb-2">{successTitle}</h3>
        <p className="text-slate text-sm font-sans">{successBody}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Leave this field blank</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {disclaimer && (
        <p className="text-xs text-slate/55 text-center font-sans">{disclaimer}</p>
      )}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="form-label">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="form-input"
            placeholder="Your full name"
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
      </div>

      <div>
        <label htmlFor="phone" className="form-label">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="form-input"
          placeholder="+1 (555) 000-0000"
        />
      </div>

      {fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id} className="form-label">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.type === "select" && (
            <select
              id={field.id}
              name={field.id}
              required={field.required}
              defaultValue=""
              className="form-input"
            >
              <option value="" disabled>
                {field.placeholder ?? "Select an option"}
              </option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          {field.type === "text" && (
            <input
              id={field.id}
              name={field.id}
              type="text"
              required={field.required}
              className="form-input"
              placeholder={field.placeholder}
            />
          )}
          {field.type === "textarea" && (
            <textarea
              id={field.id}
              name={field.id}
              rows={field.rows ?? 5}
              required={field.required}
              className="form-textarea"
              placeholder={field.placeholder}
            />
          )}
        </div>
      ))}

      {state === "error" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="form-error text-sm"
        >
          {errorMsg || "Something went wrong. Please try again."}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "submitting" ? "Submitting…" : submitLabel}
      </button>

      <p className="text-xs text-slate/55 text-center font-sans">
        Your information is kept private and will only be used to follow up on this inquiry.
      </p>
    </form>
  );
}
