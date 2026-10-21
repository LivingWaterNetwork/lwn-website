import { NextRequest } from "next/server";

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Origin check for every mutating portal request: the request's own Origin
 * header must match its own Host. Rejects cross-site POSTs that a plain
 * SameSite=Lax cookie alone wouldn't catch on a top-level navigation.
 */
export function hasValidOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
