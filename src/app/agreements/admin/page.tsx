"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Template = { id: string; key: string; version: string; title: string };

type AgreementListItem = {
  id: string;
  slug: string;
  status: string;
  isTest: boolean;
  createdAt: string;
  expiresAt: string | null;
  template: { key: string; version: string; title: string };
  signers: Array<{ role: string; name: string; status: string }>;
};

const STATUS_ORDER = ["draft", "ready", "sent", "viewed", "partially_signed", "executed", "voided", "expired"];

export default function AgreementsAdminHome() {
  const [agreements, setAgreements] = useState<AgreementListItem[] | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [includeTest, setIncludeTest] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAgreements() {
    const res = await fetch(`/api/agreements/admin/agreements?includeTest=${includeTest ? "1" : "0"}`);
    const data = await res.json();
    setAgreements(data.agreements ?? []);
  }

  useEffect(() => {
    loadAgreements().catch(() => setError("Couldn't load agreements."));
    fetch("/api/agreements/admin/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeTest]);

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: (agreements ?? []).filter((a) => a.status === status),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="section-label text-copper mb-1">LWN Agreements</p>
          <h1 className="font-serif text-3xl text-navy">Admin dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate">
            <input type="checkbox" checked={includeTest} onChange={(e) => setIncludeTest(e.target.checked)} />
            Show test records
          </label>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="rounded-lg bg-navy text-white px-4 py-2 text-sm font-semibold hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lw-blue"
          >
            {showCreate ? "Close" : "Create agreement"}
          </button>
          <LogoutButton />
        </div>
      </div>

      {showCreate && (
        <CreateAgreementForm
          templates={templates}
          onCreated={() => {
            setShowCreate(false);
            loadAgreements();
          }}
        />
      )}

      {error && <p className="text-red-700 text-sm mb-4">{error}</p>}

      {agreements === null ? (
        <p className="text-slate">Loading…</p>
      ) : agreements.length === 0 ? (
        <p className="text-slate">No agreements yet.</p>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.status}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate mb-3">
                {group.status.replace(/_/g, " ")} ({group.items.length})
              </h2>
              <div className="grid gap-3">
                {group.items.map((a) => (
                  <Link
                    key={a.id}
                    href={`/agreements/admin/${a.id}`}
                    className="block rounded-lg border border-mist bg-white p-4 hover:border-lw-blue transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-navy">
                          {a.slug} {a.isTest && <span className="ml-2 text-xs rounded bg-mist px-2 py-0.5 text-slate">TEST</span>}
                        </p>
                        <p className="text-xs text-slate mt-0.5">
                          {a.template.key} v{a.template.version} ·{" "}
                          {a.signers.map((s) => `${s.role}: ${s.status}`).join(", ")}
                        </p>
                      </div>
                      <p className="text-xs text-slate whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await fetch("/api/agreements/admin/logout", { method: "POST" });
        window.location.href = "/agreements/admin/login";
      }}
      className="text-sm text-slate underline hover:text-navy"
    >
      Sign out
    </button>
  );
}

function CreateAgreementForm({ templates, onCreated }: { templates: Template[]; onCreated: () => void }) {
  const [templateKey, setTemplateKey] = useState(templates[0]?.key ?? "");
  const [templateVersion, setTemplateVersion] = useState(templates[0]?.version ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [isTest, setIsTest] = useState(true);
  const [variablesJson, setVariablesJson] = useState('{\n  \n}');
  const [signersJson, setSignersJson] = useState(
    '[\n  { "role": "partner", "name": "", "email": "", "title": "" },\n  { "role": "participant", "name": "", "email": "" },\n  { "role": "organization", "name": "", "email": "", "title": "" }\n]'
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = templates.find((t) => t.key === templateKey);
    if (t) setTemplateVersion(t.version);
  }, [templateKey, templates]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const variables = JSON.parse(variablesJson);
      const signers = JSON.parse(signersJson);
      const res = await fetch("/api/agreements/admin/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateKey,
          templateVersion,
          name,
          email,
          variables,
          signers,
          paymentUrl: paymentUrl || undefined,
          expiresInDays,
          isTest,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create.");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid input.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-10 rounded-xl border border-mist bg-white p-6 space-y-4">
      <h2 className="font-serif text-lg text-navy">Create a new agreement</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Template</label>
          <select
            value={templateKey}
            onChange={(e) => setTemplateKey(e.target.value)}
            className="w-full rounded-lg border border-mist px-3 py-2"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.key}>
                {t.key} (v{t.version})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Participant display name (used in the slug)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-mist px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Participant email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-mist px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Payment URL (optional)</label>
          <input
            value={paymentUrl}
            onChange={(e) => setPaymentUrl(e.target.value)}
            className="w-full rounded-lg border border-mist px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Expires in (days)</label>
          <input
            type="number"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
            min={1}
            className="w-full rounded-lg border border-mist px-3 py-2"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-slate">
            <input type="checkbox" checked={isTest} onChange={(e) => setIsTest(e.target.checked)} />
            Test record (no emails sent, hidden by default, slug prefixed test-)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">Variables (JSON)</label>
        <textarea
          value={variablesJson}
          onChange={(e) => setVariablesJson(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-mist px-3 py-2 font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">Signers (JSON)</label>
        <textarea
          value={signersJson}
          onChange={(e) => setSignersJson(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-mist px-3 py-2 font-mono text-xs"
        />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-navy text-white px-4 py-2 text-sm font-semibold hover:bg-navy-light disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create draft"}
      </button>
    </form>
  );
}
