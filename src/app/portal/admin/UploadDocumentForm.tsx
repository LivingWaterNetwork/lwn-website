"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const KINDS = ["worksheet", "curriculum", "brand_website", "other"] as const;

export default function UploadDocumentForm({ enrollmentId }: { enrollmentId: string | null }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("worksheet");
  const [visibleToMember, setVisibleToMember] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", title.trim());
      form.append("kind", kind);
      if (enrollmentId) form.append("enrollmentId", enrollmentId);
      form.append("visibleToMember", String(visibleToMember));

      const res = await fetch("/api/portal/admin/documents", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Upload failed.");
        return;
      }
      setTitle("");
      setFile(null);
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-mist p-4">
      <div>
        <label htmlFor="docTitle" className="block text-xs font-medium text-slate">
          Title
        </label>
        <input
          id="docTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <div>
          <label htmlFor="docKind" className="block text-xs font-medium text-slate">
            Kind
          </label>
          <select
            id="docKind"
            value={kind}
            onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])}
            className="mt-1 min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="docFile" className="block text-xs font-medium text-slate">
            File (PDF, PNG, JPG, DOCX — 10 MB max)
          </label>
          <input
            id="docFile"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block text-sm"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          checked={visibleToMember}
          onChange={(e) => setVisibleToMember(e.target.checked)}
          className="h-5 w-5 rounded border-slate/40"
        />
        Visible to member
      </label>
      {error && (
        <p role="alert" className="text-sm text-copper">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={uploading || !file}
        className="min-h-[44px] rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
