"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddStepForm({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [dueOn, setDueOn] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/portal/admin/enrollments/${enrollmentId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), dueOn: dueOn || undefined }),
      });
      setTitle("");
      setDueOn("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="flex-1">
        <label htmlFor="stepTitle" className="block text-xs font-medium text-slate">
          New step
        </label>
        <input
          id="stepTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block min-h-[44px] w-full rounded-lg border border-slate/30 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="stepDue" className="block text-xs font-medium text-slate">
          Due
        </label>
        <input
          id="stepDue"
          type="date"
          value={dueOn}
          onChange={(e) => setDueOn(e.target.value)}
          className="mt-1 block min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="min-h-[44px] rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        Add
      </button>
    </form>
  );
}
