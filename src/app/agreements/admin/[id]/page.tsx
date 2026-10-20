"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SignatureCanvas, type SignatureCanvasHandle } from "@/components/agreements/SignatureCanvas";

type Signer = {
  id: string;
  role: string;
  order: number;
  name: string;
  email: string;
  title: string | null;
  status: string;
  signedAt: string | null;
  typedName: string | null;
};

type EventRow = {
  id: string;
  type: string;
  actorRole: string | null;
  detail: string | null;
  ip: string | null;
  createdAt: string;
};

type AgreementDetail = {
  id: string;
  slug: string;
  status: string;
  isTest: boolean;
  expiresAt: string | null;
  paymentUrl: string | null;
  voidedReason: string | null;
  template: { key: string; version: string; title: string; signerRoles: Array<{ role: string; label: string; requiredBeforeSend?: boolean }> };
  signers: Signer[];
  events: EventRow[];
  documents: Array<{ id: string; kind: string; version: number; createdAt: string }>;
};

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export default function AgreementAdminDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ agreement: AgreementDetail; previewHtml: string | null; unresolvedTokens: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const d = await api(`/api/agreements/admin/agreements/${params.id}`);
      setData(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function runAction(path: string, body?: unknown, successMessage?: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await api(`/api/agreements/admin/agreements/${params.id}/${path}`, {
        method: "POST",
        body: body ? JSON.stringify(body) : "{}",
      });
      if (result.code) {
        setNotice(`Access code (shown once — copy it now): ${result.code}`);
      } else if (successMessage) {
        setNotice(successMessage);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !data) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-red-700">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-slate">Loading…</p>
      </main>
    );
  }

  const { agreement, previewHtml, unresolvedTokens } = data;
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const signerLink = `${siteUrl}/agreements/${agreement.slug}`;

  const partner = agreement.signers.find((s) => s.role === "partner");
  const participant = agreement.signers.find((s) => s.role === "participant");
  const organization = agreement.signers.find((s) => s.role === "organization");

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/agreements/admin" className="text-sm text-lw-blue underline mb-4 inline-block">
        ← All agreements
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="font-serif text-2xl text-navy">
          {agreement.slug} {agreement.isTest && <span className="ml-2 text-xs rounded bg-mist px-2 py-0.5 text-slate align-middle">TEST</span>}
        </h1>
        <span className="text-xs font-semibold uppercase tracking-wide text-copper">{agreement.status.replace(/_/g, " ")}</span>
      </div>
      <p className="text-sm text-slate mb-6">
        {agreement.template.key} v{agreement.template.version} — {agreement.template.title}
      </p>

      {notice && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-900 text-sm p-3">{notice}</div>}
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-sm p-3">{error}</div>}

      <section className="mb-8 grid sm:grid-cols-2 gap-4">
        <InfoCard label="Link">
          <code className="text-xs break-all">{signerLink}</code>
        </InfoCard>
        <InfoCard label="Expires">{agreement.expiresAt ? new Date(agreement.expiresAt).toLocaleString() : "—"}</InfoCard>
      </section>

      {unresolvedTokens.length > 0 && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm p-4">
          <p className="font-medium mb-1">Not ready yet — unresolved tokens:</p>
          <p className="font-mono text-xs">{unresolvedTokens.map((t) => `{{${t}}}`).join(", ")}</p>
        </div>
      )}

      <section className="mb-8 rounded-xl border border-mist bg-white p-5">
        <h2 className="font-serif text-lg text-navy mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {agreement.status === "draft" && (
            <ActionButton disabled={busy || unresolvedTokens.length > 0} onClick={() => runAction("ready", {}, "Marked ready.")}>
              Mark ready
            </ActionButton>
          )}

          {partner && partner.status !== "signed" && agreement.status !== "draft" && (
            <SignActionButton
              label="Record MMG partner acceptance"
              disabled={busy}
              onSubmit={(payload) => runAction("partner-accept", payload, "Partner acceptance recorded.")}
            />
          )}

          {agreement.status === "ready" && (
            <ActionButton disabled={busy} onClick={() => runAction("send", {})}>
              Generate link &amp; send
            </ActionButton>
          )}

          {["sent", "viewed", "partially_signed"].includes(agreement.status) && (
            <>
              <ActionButton disabled={busy} onClick={() => runAction("resend", {}, "Invite link ready to copy again.")}>
                Resend (copy invite)
              </ActionButton>
              <ActionButton disabled={busy} onClick={() => runAction("regenerate-code", {})}>
                Regenerate code
              </ActionButton>
              <ExtendButton disabled={busy} onSubmit={(expiresAt) => runAction("extend", { expiresAt }, "Expiry updated.")} />
            </>
          )}

          {organization && organization.status !== "signed" && participant?.status === "signed" && (
            <SignActionButton
              label="Countersign as LWN"
              disabled={busy}
              onSubmit={(payload) => runAction("countersign", payload, "Countersigned.")}
            />
          )}

          {!["voided", "executed"].includes(agreement.status) && (
            <VoidButton disabled={busy} onSubmit={(reason) => runAction("void", { reason }, "Voided.")} />
          )}
        </div>
        {agreement.voidedReason && <p className="mt-3 text-sm text-red-700">Voided: {agreement.voidedReason}</p>}
      </section>

      <section className="mb-8 rounded-xl border border-mist bg-white p-5">
        <h2 className="font-serif text-lg text-navy mb-4">Signers</h2>
        <div className="space-y-3">
          {agreement.signers.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm border-b border-mist pb-2 last:border-0">
              <div>
                <p className="font-medium text-navy">
                  {s.name} <span className="text-slate font-normal">({s.role})</span>
                </p>
                <p className="text-xs text-slate">{s.email}</p>
              </div>
              <div className="text-right">
                <p className={s.status === "signed" ? "text-green-700" : "text-slate"}>{s.status}</p>
                {s.signedAt && <p className="text-xs text-slate">{new Date(s.signedAt).toLocaleString()}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-mist bg-white p-5">
        <h2 className="font-serif text-lg text-navy mb-4">Documents</h2>
        {agreement.documents.length === 0 ? (
          <p className="text-sm text-slate">No signed PDFs generated yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {["draft", "participant_signed", "executed"].map((kind) => (
              <a
                key={kind}
                href={`/api/agreements/admin/agreements/${agreement.id}/download/${kind}`}
                className="text-sm text-lw-blue underline"
              >
                Download {kind.replace(/_/g, " ")}
              </a>
            ))}
          </div>
        )}
        <a
          href={`/api/agreements/admin/agreements/${agreement.id}/download/draft`}
          className="mt-2 inline-block text-sm text-lw-blue underline"
        >
          Preview draft PDF
        </a>
      </section>

      {previewHtml && (
        <section className="mb-8 rounded-xl border border-mist bg-white p-5">
          <h2 className="font-serif text-lg text-navy mb-4">Preview</h2>
          <div className="prose prose-sm max-w-none max-h-[480px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </section>
      )}

      <section className="rounded-xl border border-mist bg-white p-5">
        <h2 className="font-serif text-lg text-navy mb-4">Event log</h2>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {agreement.events.map((e) => (
            <div key={e.id} className="flex justify-between text-xs border-b border-mist pb-1.5 last:border-0">
              <span className="font-medium text-navy">
                {e.type} {e.detail && <span className="text-slate font-normal">({e.detail})</span>}
              </span>
              <span className="text-slate">
                {e.actorRole ?? "system"} · {new Date(e.createdAt).toLocaleString()} {e.ip ? `· ${e.ip}` : ""}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-mist bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate mb-1">{label}</p>
      <div className="text-sm text-navy">{children}</div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-navy text-white px-4 py-2 text-sm font-semibold hover:bg-navy-light disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function ExtendButton({ onSubmit, disabled }: { onSubmit: (expiresAt: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");

  if (!open) {
    return (
      <ActionButton onClick={() => setOpen(true)} disabled={disabled}>
        Extend expiry
      </ActionButton>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-mist px-2 py-1.5 text-sm" />
      <button
        onClick={() => {
          if (date) onSubmit(new Date(date).toISOString());
          setOpen(false);
        }}
        className="rounded-lg bg-navy text-white px-3 py-1.5 text-sm"
      >
        Save
      </button>
    </div>
  );
}

function VoidButton({ onSubmit, disabled }: { onSubmit: (reason: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="rounded-lg border border-red-300 text-red-700 px-4 py-2 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
      >
        Void
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason"
        className="rounded-lg border border-mist px-2 py-1.5 text-sm"
      />
      <button
        onClick={() => {
          if (reason.trim()) onSubmit(reason.trim());
          setOpen(false);
        }}
        className="rounded-lg bg-red-700 text-white px-3 py-1.5 text-sm"
      >
        Confirm void
      </button>
    </div>
  );
}

function SignActionButton({
  label,
  onSubmit,
  disabled,
}: {
  label: string;
  onSubmit: (payload: { typedName: string; signatureImage?: string }) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [typedName, setTypedName] = useState("");
  const signatureRef = useRef<SignatureCanvasHandle>(null);

  if (!open) {
    return (
      <ActionButton onClick={() => setOpen(true)} disabled={disabled}>
        {label}
      </ActionButton>
    );
  }

  return (
    <div className="w-full rounded-lg border border-mist p-4 bg-mist/40">
      <p className="text-sm font-medium text-navy mb-2">{label}</p>
      <input
        value={typedName}
        onChange={(e) => setTypedName(e.target.value)}
        placeholder="Typed full name"
        className="w-full rounded-lg border border-mist px-3 py-2 mb-3 font-serif italic"
      />
      <SignatureCanvas ref={signatureRef} />
      <p className="mt-2 text-xs text-slate">
        By confirming, this signs the agreement electronically with the same effect as a handwritten signature.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            if (!typedName.trim()) return;
            onSubmit({ typedName: typedName.trim(), signatureImage: signatureRef.current?.toDataUrl() ?? undefined });
            setOpen(false);
            setTypedName("");
          }}
          className="rounded-lg bg-copper text-white px-4 py-2 text-sm font-semibold hover:bg-copper-dark"
        >
          Confirm &amp; sign
        </button>
        <button onClick={() => setOpen(false)} className="text-sm text-slate underline">
          Cancel
        </button>
      </div>
    </div>
  );
}
