"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateStepFromSession({ enrollmentId, sessionId }: { enrollmentId: string; sessionId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/portal/admin/enrollments/${enrollmentId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), meetingId: sessionId }),
      });
      setTitle("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <label htmlFor="newStepTitle" className="sr-only">
        New step from this session
      </label>
      <input
        id="newStepTitle"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a step from this session"
        className="block min-h-[44px] flex-1 rounded-lg border border-slate/30 px-3 py-2 text-sm"
      />
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
