import { NextRequest } from "next/server";

/**
 * In-memory sliding-window rate limiter. Scoped to a single warm serverless
 * instance — not perfectly global across Vercel's fleet — but it's a real,
 * zero-infra deterrent against a script hammering one form from one IP,
 * which is the actual abuse pattern seen on small nonprofit sites.
 */
const hits = new Map<string, number[]>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export interface RateLimitOptions {
  /** Requests allowed per window. */
  limit?: number;
  /** Window size in milliseconds. */
  windowMs?: number;
}

/** Returns true if this request should be allowed, false if it's over the limit. */
export function checkRateLimit(
  req: NextRequest,
  routeKey: string,
  { limit = 5, windowMs = 10 * 60 * 1000 }: RateLimitOptions = {}
): boolean {
  const key = `${routeKey}:${getClientIp(req)}`;
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(key, timestamps);

  // Opportunistic cleanup so the map doesn't grow unbounded on a long-lived warm instance.
  if (hits.size > 5000) {
    Array.from(hits.entries()).forEach(([k, ts]) => {
      if (ts.every((t) => now - t >= windowMs)) hits.delete(k);
    });
  }

  return true;
}
