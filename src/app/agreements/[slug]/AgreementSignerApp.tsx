"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { splitHtmlIntoSections } from "@/lib/agreements/htmlSections";
import { computeInitials } from "@/lib/agreements/names";
import { SignatureCanvas, type SignatureCanvasHandle } from "@/components/agreements/SignatureCanvas";

type RequiredInitial = { section: string; label: string };

type AgreementState = {
  agreement: { status: string; expiresAt: string | null; paymentUrl: string | null; firstPaymentLabel: string | null };
  template: { title: string };
  participant: {
    name: string;
    email: string;
    status: string;
    identityConfirmed: boolean;
    consentVersion: string | null;
    initials: Record<string, boolean>;
    typedName: string | null;
  };
  signers: Array<{ role: string; name: string; title: string | null; status: string; signedAt: string | null }>;
  requiredInitials: RequiredInitial[];
  consent: { currentVersion: string; paragraphs: string[] };
  html: string | null;
};

type UiStep = "loading" | "code" | "confirm" | "consent" | "read" | "done";

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.error || "Something went wrong."), { status: res.status, data });
  }
  return data;
}

export function AgreementSignerApp({ slug }: { slug: string }) {
  const [state, setState] = useState<AgreementState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [needsCode, setNeedsCode] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api(`/api/agreements/${slug}/state`);
      setState(data);
      setNeedsCode(false);
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e.status === 401) {
        setNeedsCode(true);
      } else {
        setLoadError(e.message || "Couldn't load this agreement. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const step: UiStep = loading
    ? "loading"
    : needsCode
    ? "code"
    : !state
    ? "loading"
    : state.participant.status === "signed"
    ? "done"
    : !state.participant.identityConfirmed
    ? "confirm"
    : !state.participant.consentVersion
    ? "consent"
    : "read";

  if (loadError) {
    return (
      <Centered>
        <ErrorCard message={loadError} onRetry={load} />
      </Centered>
    );
  }

  if (step === "loading") {
    return (
      <Centered>
        <p className="text-slate">Loading your agreement…</p>
      </Centered>
    );
  }

  if (step === "code") {
    return (
      <Centered>
        <CodeEntryScreen slug={slug} onSuccess={load} />
      </Centered>
    );
  }

  if (!state) return null;

  if (step === "confirm") {
    return (
      <Centered>
        <ConfirmIdentityScreen slug={slug} name={state.participant.name} email={state.participant.email} onConfirmed={load} />
      </Centered>
    );
  }

  if (step === "consent") {
    return (
      <Centered>
        <ConsentScreen
          slug={slug}
          paragraphs={state.consent.paragraphs}
          onConsented={load}
        />
      </Centered>
    );
  }

  if (step === "done") {
    return (
      <Centered wide>
        <DoneScreen slug={slug} state={state} onRefresh={load} />
      </Centered>
    );
  }

  return <ReadAndSignScreen slug={slug} state={state} onRefresh={load} />;
}

function Centered({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <main className="min-h-screen bg-mist flex items-start sm:items-center justify-center px-4 py-10 sm:py-16">
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>{children}</div>
    </main>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-mist p-6 text-center">
      <p className="text-navy font-semibold mb-2">We hit a snag.</p>
      <p className="text-sm text-slate mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center justify-center rounded-lg bg-navy text-white px-4 py-2 text-sm font-medium hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lw-blue"
      >
        Retry
      </button>
    </div>
  );
}

function CodeEntryScreen({ slug, onSuccess }: { slug: string; onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api(`/api/agreements/${slug}/login`, { method: "POST", body: JSON.stringify({ code }) });
      onSuccess();
    } catch (err: unknown) {
      const e2 = err as { status?: number; data?: { lockedUntil?: string; attemptsRemaining?: number }; message?: string };
      if (e2.status === 423 && e2.data?.lockedUntil) {
        setLockedUntil(e2.data.lockedUntil);
      } else if (e2.status === 401 && e2.data?.attemptsRemaining !== undefined) {
        setError(`That code doesn't match. ${e2.data.attemptsRemaining} attempt${e2.data.attemptsRemaining === 1 ? "" : "s"} remaining.`);
      } else {
        setError(e2.message || "That code doesn't match.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (lockedUntil) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-mist p-6 sm:p-8 text-center">
        <h1 className="font-serif text-xl text-navy mb-2">Too many attempts</h1>
        <p className="text-sm text-slate">
          For security, this link is temporarily locked. Please try again after{" "}
          {new Date(lockedUntil).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}, or email{" "}
          <a className="text-lw-blue underline" href="mailto:info@lwnetwork.org">
            info@lwnetwork.org
          </a>{" "}
          for help.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-mist p-6 sm:p-8">
      <h1 className="font-serif text-2xl text-navy mb-2">Welcome.</h1>
      <p className="text-sm text-slate mb-6">
        You were sent a private link and a separate access code. Enter your code below to continue.
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="access-code" className="block text-sm font-medium text-navy mb-1.5">
          Access code
        </label>
        <input
          id="access-code"
          name="code"
          autoComplete="one-time-code"
          autoCapitalize="characters"
          inputMode="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full rounded-lg border border-mist px-4 py-3 text-lg tracking-[0.2em] text-center font-mono uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lw-blue"
          placeholder="XXXXXXXX"
          maxLength={32}
          required
        />
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting || !code.trim()}
          className="mt-5 w-full inline-flex items-center justify-center rounded-lg bg-navy text-white px-4 py-3 text-sm font-semibold hover:bg-navy-light disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lw-blue"
        >
          {submitting ? "Checking…" : "Continue"}
        </button>
      </form>
      <p className="mt-5 text-xs text-slate text-center">
        Need help?{" "}
        <a className="text-lw-blue underline" href="mailto:info@lwnetwork.org">
          info@lwnetwork.org
        </a>
      </p>
    </div>
  );
}

function ConfirmIdentityScreen({
  slug,
  name,
  email,
  onConfirmed,
}: {
  slug: string;
  name: string;
  email: string;
  onConfirmed: () => void;
}) {
  const [confirmEmail, setConfirmEmail] = useState(email);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // This is a friendly check, not identity verification — the access
      // code is what actually gates this agreement. The server records it
      // and will not allow consent until it's done, so the check can't be
      // skipped by reloading past this screen.
      await api(`/api/agreements/${slug}/confirm-identity`, {
        method: "POST",
        body: JSON.stringify({ email: confirmEmail }),
      });
      onConfirmed();
    } catch (err: unknown) {
      setError((err as Error).message || "That doesn't match the email we have on file.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-mist p-6 sm:p-8">
      <h1 className="font-serif text-xl text-navy mb-2">This agreement is for {name}.</h1>
      <p className="text-sm text-slate mb-6">Please confirm your email address to continue.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="confirm-email" className="block text-sm font-medium text-navy mb-1.5">
          Email address
        </label>
        <input
          id="confirm-email"
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          className="w-full rounded-lg border border-mist px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lw-blue"
          required
        />
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full inline-flex items-center justify-center rounded-lg bg-navy text-white px-4 py-3 text-sm font-semibold hover:bg-navy-light disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lw-blue"
        >
          {submitting ? "Checking…" : "That's me — continue"}
        </button>
      </form>
    </div>
  );
}

function ConsentScreen({
  slug,
  paragraphs,
  onConsented,
}: {
  slug: string;
  paragraphs: string[];
  onConsented: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    setSubmitting(true);
    setError(null);
    try {
      await api(`/api/agreements/${slug}/consent`, { method: "POST", body: JSON.stringify({}) });
      onConsented();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-mist p-6 sm:p-8">
      <h1 className="font-serif text-xl text-navy mb-4">Doing business electronically</h1>
      <ul className="space-y-3 mb-6">
        {paragraphs.map((p, i) => (
          <li key={i} className="text-sm text-slate leading-relaxed flex gap-2">
            <span className="text-copper" aria-hidden>
              ·
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <label className="flex items-start gap-3 cursor-pointer mb-5">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-slate text-navy focus-visible:ring-2 focus-visible:ring-lw-blue"
        />
        <span className="text-sm text-navy">I agree to receive and sign this agreement electronically.</span>
      </label>
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        onClick={handleContinue}
        disabled={!agreed || submitting}
        className="w-full inline-flex items-center justify-center rounded-lg bg-navy text-white px-4 py-3 text-sm font-semibold hover:bg-navy-light disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lw-blue"
      >
        {submitting ? "Saving…" : "Continue to the agreement"}
      </button>
    </div>
  );
}

function ReadAndSignScreen({
  slug,
  state,
  onRefresh,
}: {
  slug: string;
  state: AgreementState;
  onRefresh: () => void;
}) {
  const sections = useMemo(() => splitHtmlIntoSections(state.html ?? ""), [state.html]);
  const [initials, setInitials] = useState<Record<string, boolean>>(state.participant.initials);
  const [initialErrors, setInitialErrors] = useState<Record<string, string>>({});
  const [initialSaving, setInitialSaving] = useState<Record<string, boolean>>({});
  const [typedName, setTypedName] = useState("");
  const [signatureHasDrawing, setSignatureHasDrawing] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signatureRef = useRef<SignatureCanvasHandle>(null);

  const requiredDone = state.requiredInitials.every((r) => initials[r.section]);
  const nameMatches =
    typedName.trim().toLowerCase().replace(/\s+/g, " ") === state.participant.name.trim().toLowerCase().replace(/\s+/g, " ");

  const totalSteps = state.requiredInitials.length + 1;
  const doneSteps = state.requiredInitials.filter((r) => initials[r.section]).length;

  // The server's response is the source of truth: on success, `initials`
  // reflects exactly what got saved; on failure, the checkbox rolls back to
  // its last known-good value rather than optimistically staying "checked,"
  // which previously let someone think a section was initialed when it
  // wasn't — and then hit a confusing error only once they tried to sign.
  async function toggleInitial(section: string, next: boolean) {
    const previous = Boolean(initials[section]);
    setInitials((prev) => ({ ...prev, [section]: next }));
    setInitialErrors((prev) => ({ ...prev, [section]: "" }));
    setInitialSaving((prev) => ({ ...prev, [section]: true }));
    try {
      const res = await fetch(`/api/agreements/${slug}/initial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, initialed: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Couldn't save — please try again.");
      }
      if (data.initials) setInitials(data.initials);
    } catch (err) {
      setInitials((prev) => ({ ...prev, [section]: previous }));
      setInitialErrors((prev) => ({
        ...prev,
        [section]: err instanceof Error ? err.message : "Couldn't save — please try again.",
      }));
    } finally {
      setInitialSaving((prev) => ({ ...prev, [section]: false }));
    }
  }

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    setSigning(true);
    setError(null);
    try {
      const signatureImage = signatureRef.current?.toDataUrl() ?? undefined;
      await api(`/api/agreements/${slug}/sign`, {
        method: "POST",
        body: JSON.stringify({ typedName, signatureImage }),
      });
      onRefresh();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSigning(false);
    }
  }

  return (
    <main className="min-h-screen bg-mist">
      <div className="sticky top-0 z-10 bg-white border-b border-mist print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <p className="font-serif text-navy text-sm sm:text-base truncate">{state.template.title}</p>
          <p className="text-xs text-slate whitespace-nowrap">
            {doneSteps} of {totalSteps} steps done
          </p>
        </div>
        <nav aria-label="Sections" className="max-w-5xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
          {sections
            .filter((s) => s.sectionNumber)
            .map((s) => (
              <a
                key={s.sectionNumber}
                href={`#section-${s.sectionNumber}`}
                className="shrink-0 rounded-full border border-mist px-3 py-1 text-xs text-slate hover:border-lw-blue hover:text-lw-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lw-blue"
              >
                {s.sectionNumber}
              </a>
            ))}
        </nav>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-4 print:hidden">
          <a
            href={`/api/agreements/${slug}/download/draft`}
            className="text-sm text-lw-blue underline hover:text-lw-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lw-blue rounded"
          >
            Download draft PDF
          </a>
        </div>

        <article className="prose prose-sm sm:prose-base max-w-none bg-white rounded-xl border border-mist p-5 sm:p-8">
          {sections.map((section, i) => {
            const required = state.requiredInitials.find((r) => r.section === section.sectionNumber);
            return (
              <div key={i} id={section.sectionNumber ? `section-${section.sectionNumber}` : undefined}>
                <div dangerouslySetInnerHTML={{ __html: section.html }} />
                {required && (
                  <div className="not-prose my-4 rounded-lg border border-copper/40 bg-mist/60 p-4 print:hidden">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(initials[required.section])}
                        disabled={initialSaving[required.section]}
                        onChange={(e) => toggleInitial(required.section, e.target.checked)}
                        className="mt-0.5 h-5 w-5 rounded border-slate text-navy focus-visible:ring-2 focus-visible:ring-lw-blue disabled:opacity-50"
                      />
                      <span className="text-sm text-navy">
                        I have read and initial this section: <strong>{required.label}</strong>
                      </span>
                    </label>
                    {initials[required.section] && (
                      <p className="mt-2 ml-8 font-serif italic text-navy" title={state.participant.name}>
                        {computeInitials(state.participant.name)}
                      </p>
                    )}
                    {initialErrors[required.section] && (
                      <div className="mt-2 ml-8 flex items-center gap-3">
                        <p role="alert" className="text-sm text-red-700">
                          {initialErrors[required.section]}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleInitial(required.section, true)}
                          className="text-sm font-medium text-copper hover:text-copper-dark underline"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </article>

        <form
          onSubmit={handleSign}
          className="mt-8 bg-white rounded-xl border border-mist p-5 sm:p-8 print:hidden"
          aria-labelledby="sign-heading"
        >
          <h2 id="sign-heading" className="font-serif text-xl text-navy mb-1">
            Sign
          </h2>
          <p className="text-sm text-slate mb-5">
            {requiredDone
              ? "Type your full legal name exactly as it appears on the agreement, and optionally draw your signature."
              : "Please initial every required section above before signing."}
          </p>

          <label htmlFor="typed-name" className="block text-sm font-medium text-navy mb-1.5">
            Full legal name
          </label>
          <input
            id="typed-name"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            disabled={!requiredDone}
            className="w-full rounded-lg border border-mist px-4 py-3 font-serif italic text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lw-blue disabled:bg-mist/50"
            placeholder={state.participant.name}
            required
          />

          <div className="mt-5">
            <p className="block text-sm font-medium text-navy mb-1.5">Signature (optional)</p>
            <SignatureCanvas ref={signatureRef} onChange={setSignatureHasDrawing} />
          </div>

          <p className="mt-5 text-xs text-slate">
            By selecting &ldquo;I agree and sign,&rdquo; I am signing this Agreement electronically. My electronic
            signature has the same effect as a handwritten signature.
          </p>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!requiredDone || !nameMatches || signing}
            className="mt-5 w-full inline-flex items-center justify-center rounded-lg bg-copper text-white px-4 py-3 text-sm font-semibold hover:bg-copper-dark disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-copper"
          >
            {signing ? "Signing…" : "I agree and sign"}
          </button>
          {typedName.length > 0 && !nameMatches && (
            <p className="mt-2 text-xs text-slate">Please type your name exactly as it appears: &ldquo;{state.participant.name}&rdquo;</p>
          )}
        </form>
      </div>
    </main>
  );
}

function DoneScreen({ slug, state, onRefresh }: { slug: string; state: AgreementState; onRefresh: () => void }) {
  const executed = state.agreement.status === "executed";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-mist p-6 sm:p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mist text-copper text-2xl" aria-hidden>
        ✓
      </div>
      <h1 className="font-serif text-2xl text-navy mb-2">{executed ? "Fully executed." : "Thank you for signing."}</h1>
      <p className="text-sm text-slate mb-6">
        {executed
          ? "This agreement has been signed by everyone and is now fully executed."
          : "Living Water Network will countersign shortly. You'll be able to download the final copy from this same link once it's complete."}
      </p>

      <div className="flex flex-col gap-3">
        {executed ? (
          <a
            href={`/api/agreements/${slug}/download/executed`}
            className="inline-flex items-center justify-center rounded-lg bg-navy text-white px-4 py-3 text-sm font-semibold hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lw-blue"
          >
            Download your fully executed agreement
          </a>
        ) : (
          <a
            href={`/api/agreements/${slug}/download/participant_signed`}
            className="inline-flex items-center justify-center rounded-lg bg-navy text-white px-4 py-3 text-sm font-semibold hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lw-blue"
          >
            Download your signed copy
          </a>
        )}

        {state.agreement.paymentUrl && (
          <a
            href={state.agreement.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-copper text-white px-4 py-3 text-sm font-semibold hover:bg-copper-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-copper"
          >
            Make your first payment{state.agreement.firstPaymentLabel ? ` (${state.agreement.firstPaymentLabel})` : ""}
          </a>
        )}

        {!executed && (
          <button
            onClick={onRefresh}
            className="text-sm text-lw-blue underline hover:text-lw-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lw-blue rounded"
          >
            Check for updates
          </button>
        )}
      </div>
    </div>
  );
}
