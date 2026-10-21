"use client";

import { useEffect, useState } from "react";

/**
 * Renders an ISO timestamp in the VIEWER's own local timezone, with a zone
 * label. Server-rendered pages can't know the browser's timezone, so this
 * renders a server-safe placeholder first and fills in the real local time
 * after mount — avoiding a hydration mismatch while still showing the
 * correct time for a member in a different timezone than the coach/server.
 */
export default function LocalDateTime({ iso, fallback }: { iso: string; fallback: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const date = new Date(iso);
    const formatted = date.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
    setText(formatted);
  }, [iso]);

  return <span suppressHydrationWarning>{text ?? fallback}</span>;
}
