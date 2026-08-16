"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getYanAdminModel, type YanAdminField } from "@/lib/yanAdminSchema";

type Row = Record<string, unknown> & { id: string };

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: YanAdminField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const base = "w-full px-3 py-2 rounded-lg border border-yan-navy/15 bg-white text-yan-navy text-sm focus:outline-none focus:ring-2 focus:ring-yan-blue";

  if (field.type === "boolean") {
    return (
      <label className="inline-flex items-center gap-2 text-sm text-yan-navy">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    );
  }
  if (field.type === "select") {
    return (
      <select className={base} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {field.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "textarea") {
    return (
      <textarea
        className={base}
        rows={4}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === "datetime") {
    return (
      <input
        type="datetime-local"
        className={base}
        value={value ? String(value).slice(0, 16) : ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
      className={base}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function YanAdminModelClient({ modelKey }: { modelKey: string }) {
  const config = getYanAdminModel(modelKey);
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/yan/admin/${modelKey}`);
    const json = await res.json();
    setItems(res.ok ? json.items ?? [] : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelKey]);

  if (!config) return <p className="text-white/70">Unknown model.</p>;

  function startEdit(row: Row | null) {
    setError(null);
    if (row) {
      setEditing(row.id);
      setForm({ ...row });
    } else {
      setEditing("new");
      setForm({});
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    const isNew = editing === "new";
    const url = isNew ? `/api/yan/admin/${modelKey}` : `/api/yan/admin/${modelKey}/${editing}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error ?? "Failed to save.");
      return;
    }
    setEditing(null);
    load();
  }

  async function toggleField(row: Row, fieldName: string) {
    await fetch(`/api/yan/admin/${modelKey}/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [fieldName]: !row[fieldName] }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this record? This can't be undone.")) return;
    await fetch(`/api/yan/admin/${modelKey}/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/yan/admin" className="text-white/50 text-xs hover:text-white/80">
            &larr; All content
          </Link>
          <h1 className="yan-h2 text-white mt-2">{config.pluralLabel}</h1>
        </div>
        <button onClick={() => startEdit(null)} className="yan-btn-primary text-sm">
          + New {config.label}
        </button>
      </div>

      {editing && (
        <div className="yan-card mb-8">
          <h2 className="yan-h3 text-yan-navy mb-4">{editing === "new" ? `New ${config.label}` : `Edit ${config.label}`}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {config.fields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                {field.type !== "boolean" && (
                  <label className="block text-xs font-semibold text-yan-navy/70 mb-1">
                    {field.label}
                    {field.required ? " *" : ""}
                  </label>
                )}
                <FieldInput
                  field={field}
                  value={form[field.name]}
                  onChange={(v) => setForm((f) => ({ ...f, [field.name]: v }))}
                />
                {field.helpText && <p className="text-xs text-yan-navy/40 mt-1">{field.helpText}</p>}
              </div>
            ))}
          </div>
          {error && <p className="yan-form-error mt-4">{error}</p>}
          <div className="flex gap-3 mt-6">
            <button onClick={save} disabled={saving} className="yan-btn-primary !bg-yan-blue text-sm disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(null)} className="yan-btn-ghost text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="yan-card overflow-x-auto">
        {loading ? (
          <p className="text-yan-navy/50 text-sm">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-yan-navy/50 text-sm">No {config.pluralLabel.toLowerCase()} yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-yan-navy/10">
                {config.listColumns.map((col) => (
                  <th key={col} className="pb-2 pr-4 font-semibold text-yan-navy/60 whitespace-nowrap">
                    {col}
                  </th>
                ))}
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-yan-navy/5 last:border-0">
                  {config.listColumns.map((col) => (
                    <td key={col} className="py-2.5 pr-4 text-yan-navy/80 max-w-[16rem] truncate align-top">
                      {config.quickToggleFields?.includes(col) ? (
                        <button
                          onClick={() => toggleField(row, col)}
                          className={`text-xs px-2 py-1 rounded-full border ${
                            row[col] ? "bg-yan-blue/10 border-yan-blue text-yan-blue" : "border-yan-navy/15 text-yan-navy/40"
                          }`}
                        >
                          {row[col] ? "Yes" : "No"}
                        </button>
                      ) : typeof row[col] === "boolean" ? (
                        row[col] ? "Yes" : "No"
                      ) : (
                        String(row[col] ?? "—")
                      )}
                    </td>
                  ))}
                  <td className="py-2.5 whitespace-nowrap">
                    <button onClick={() => startEdit(row)} className="text-yan-blue text-xs font-semibold mr-3">
                      Edit
                    </button>
                    <button onClick={() => remove(row.id)} className="text-red-500 text-xs font-semibold">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
