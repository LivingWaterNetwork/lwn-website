"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { HONEYPOT_FIELD } from "@/lib/yanValidation";
import { track } from "@/lib/yanAnalytics";

const PATHWAYS = [
  { key: "ministry-leader", label: "I lead a young-adult ministry or group", needsMinistry: true },
  { key: "pastor", label: "I am a pastor or church leader", needsMinistry: true },
  { key: "roundtable-interest", label: "I want to attend the Leaders Roundtable", needsMinistry: false },
  { key: "find-community", label: "I want to find a young-adult community", needsMinistry: false },
  { key: "partner-volunteer", label: "I want to partner, volunteer, or share a resource", needsMinistry: true },
  { key: "updates", label: "I want updates as the network launches", needsMinistry: false },
] as const;

type PathwayKey = (typeof PATHWAYS)[number]["key"];

function JoinFormInner() {
  const params = useSearchParams();
  const initialPath = params.get("path") as PathwayKey | null;

  const [pathway, setPathway] = useState<PathwayKey | null>(
    PATHWAYS.some((p) => p.key === initialPath) ? initialPath : null
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    ministryName: "",
    city: params.get("city") ?? "",
    role: "",
    message: "",
    [HONEYPOT_FIELD]: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pathway) track("yan_join_started", { pathway });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathway]);

  const activePathway = PATHWAYS.find((p) => p.key === pathway);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pathway) return;
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/yan/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathway, ...form }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      track("yan_join_completed", { pathway });
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="yan-card text-center py-12">
        <h3 className="yan-h3 text-yan-navy mb-2">You&apos;re on the list.</h3>
        <p className="yan-body text-yan-navy/60 max-w-md mx-auto">
          Thank you — someone from the YAN team will follow up soon. In the meantime, keep an eye
          on your inbox for updates as the network takes shape.
        </p>
      </div>
    );
  }

  return (
    <div className="yan-card">
      {!pathway ? (
        <>
          <p className="yan-eyebrow mb-2">Step 1 of 2</p>
          <h2 className="yan-h3 text-yan-navy mb-6">What brings you here?</h2>
          <div className="space-y-2">
            {PATHWAYS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPathway(p.key)}
                className="w-full text-left px-4 py-3.5 rounded-xl border border-yan-navy/10 hover:border-yan-blue hover:bg-yan-blue/5 transition-colors text-sm font-yan-body font-medium text-yan-navy"
              >
                {p.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="yan-eyebrow mb-1">Step 2 of 2</p>
              <h2 className="yan-h3 text-yan-navy">{activePathway?.label}</h2>
            </div>
            <button
              type="button"
              onClick={() => setPathway(null)}
              className="text-xs text-yan-navy/40 hover:text-yan-navy shrink-0"
            >
              Change
            </button>
          </div>

          <div className="hp-field" aria-hidden="true">
            <label htmlFor="yan-join-website">Leave this field empty</label>
            <input
              id="yan-join-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form[HONEYPOT_FIELD]}
              onChange={(e) => setForm((f) => ({ ...f, [HONEYPOT_FIELD]: e.target.value }))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="join-name" className="yan-form-label">
                Name *
              </label>
              <input
                id="join-name"
                required
                className="yan-form-input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="join-email" className="yan-form-label">
                Email *
              </label>
              <input
                id="join-email"
                type="email"
                required
                className="yan-form-input"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="join-phone" className="yan-form-label">
                Phone
              </label>
              <input
                id="join-phone"
                className="yan-form-input"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="join-city" className="yan-form-label">
                City / area
              </label>
              <input
                id="join-city"
                className="yan-form-input"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            {activePathway?.needsMinistry && (
              <>
                <div>
                  <label htmlFor="join-ministry" className="yan-form-label">
                    Ministry / group name
                  </label>
                  <input
                    id="join-ministry"
                    className="yan-form-input"
                    value={form.ministryName}
                    onChange={(e) => setForm((f) => ({ ...f, ministryName: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="join-role" className="yan-form-label">
                    Your role
                  </label>
                  <input
                    id="join-role"
                    className="yan-form-input"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="join-message" className="yan-form-label">
              Anything else we should know?
            </label>
            <textarea
              id="join-message"
              rows={4}
              className="yan-form-textarea"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>

          {error && (
            <p role="alert" className="yan-form-error mb-4">
              {error}
            </p>
          )}

          <p className="text-xs text-yan-navy/40 mb-4">
            By submitting, you agree to be contacted by the YAN team about this request. We won&apos;t
            share your information outside Living Water Network.
          </p>

          <button type="submit" disabled={status === "submitting"} className="yan-btn-primary !bg-yan-blue w-full disabled:opacity-60">
            {status === "submitting" ? "Submitting…" : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
}

export function YanJoinForm() {
  return (
    <Suspense fallback={<div className="yan-card h-96 animate-pulse" />}>
      <JoinFormInner />
    </Suspense>
  );
}
