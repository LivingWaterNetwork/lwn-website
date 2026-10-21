"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "lwn-portal-hide-progress";

/**
 * Interim, device-local opt-out of the progress/streak UI. A durable,
 * per-account preference (synced across devices) is prepared in
 * migration 002 (see src/lib/portal/migrationStatements.ts) but not yet
 * applied to the database — this localStorage toggle is the stand-in until
 * that lands. Wrapped in try/catch since storage can throw or be
 * unavailable (private browsing, blocked site data).
 */
export function useHideProgress(): [boolean, (hide: boolean) => void] {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    try {
      setHide(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // ignore — default to showing progress
    }
  }, []);

  function update(next: boolean) {
    setHide(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, "1");
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore — the in-memory state above still reflects the choice for this session
    }
  }

  return [hide, update];
}

/** Hides its children when the member has opted out of progress/streak UI on this device. */
export default function ProgressGate({ children }: { children: React.ReactNode }) {
  const [hide] = useHideProgress();
  if (hide) return null;
  return <>{children}</>;
}
