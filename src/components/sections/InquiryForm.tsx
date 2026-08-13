"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type FormState = "idle" | "submitting" | "error";

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

export type InquiryField = SelectField | TextField | TextareaField;

type InquiryFormProps = {
  endpoint: string;
  thankYouHref: string;
  fields: InquiryField[];
  submitLabel?: string;
  includeOrganization?: boolean;
};

export function InquiryForm({
  endpoint,
  thankYouHref,
  fields,
  submitLabel = "Submit",
  includeOrganization = true,
}: InquiryFormProps) {
  const router = useRouter();
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries()) as Record<string, string>;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push(thankYouHref);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="form-label">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input id="name" name="name" type="text" required className="form-input" placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor="email" className="form-label">
            Email <span className="text-red-500">*</span>
          </label>
          <input id="email" name="email" type="email" required className="form-input" placeholder="you@example.com" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className="form-label">
            Phone
          </label>
          <input id="phone" name="phone" type="tel" className="form-input" placeholder="+1 (555) 000-0000" />
        </div>
        {includeOrganization && (
          <div>
            <label htmlFor="organization" className="form-label">
              Organization <span className="text-slate/50">(optional)</span>
            </label>
            <input id="organization" name="organization" type="text" className="form-input" placeholder="Church, company, or ministry" />
          </div>
        )}
      </div>

      {fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id} className="form-label">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.type === "select" && (
            <select id={field.id} name={field.id} required={field.required} defaultValue="" className="form-input">
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
            <input id={field.id} name={field.id} type="text" required={field.required} className="form-input" placeholder={field.placeholder} />
          )}
          {field.type === "textarea" && (
            <textarea id={field.id} name={field.id} rows={field.rows ?? 5} required={field.required} className="form-textarea" placeholder={field.placeholder} />
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

      <button type="submit" disabled={state === "submitting"} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
        {state === "submitting" ? "Submitting…" : submitLabel}
      </button>

      <p className="text-xs text-slate/55 text-center font-sans">
        Your information is kept private and will only be used to follow up on this inquiry.
      </p>
    </form>
  );
}
