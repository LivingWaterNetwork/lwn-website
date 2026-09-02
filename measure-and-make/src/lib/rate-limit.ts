import "server-only";

/**
 * Small in-memory, per-IP limiter — the same anti-abuse posture as the sibling
 * Living Water Network forms (honeypot plus per-IP rate limiting), without
 * standing up any storage for it. Per-process, so it resets on deploy; that is
 * an accepted limit for a low-volume contact form.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

export function allowRequest(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-lived process.
  if (hits.size > 5000) {
    hits.forEach((times, existingKey) => {
      if (times.every((time) => now - time >= WINDOW_MS))
        hits.delete(existingKey);
    });
  }

  return true;
}
