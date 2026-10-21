import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto";

/**
 * Returns PORTAL_SESSION_SECRET, or throws. Per the portal's hard rules:
 * if it's missing, callers must stop and tell Omar — never fall back to a
 * default, and never ask for the value itself.
 */
export function getPortalSecret(): string {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "PORTAL_SESSION_SECRET is not configured for this environment. Omar needs to set it in Vercel (Sensitive, different values for Preview and Production) before the portal can run."
    );
  }
  return secret;
}

/** Hex-encoded HMAC-SHA256 of `value`, keyed by `secret`. Used for every portal secret-at-rest: login codes, link tokens, email lookups, and session tokens — all keyed so rotating PORTAL_SESSION_SECRET invalidates every stored hash at once. */
export function hmacHex(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value, "utf8").digest("hex");
}

/** Constant-time comparison of two hex strings (e.g. two HMAC digests). */
export function constantTimeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Generates a random 6-digit login code (as a zero-padded string, e.g. "042817"). */
export function generateLoginCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** Generates a random 32-byte session token, base64url-encoded, to go in the session cookie. */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Generates a random magic-link token (separate secret from the 6-digit code shown alongside it). */
export function generateLinkToken(): string {
  return randomBytes(24).toString("base64url");
}

/** sha256 of a UTF-8 string, hex-encoded. */
export function sha256Hex(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

/** sha256 of raw bytes (e.g. an uploaded document), hex-encoded. */
export function sha256HexOfBytes(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Lowercases and trims an email for consistent hashing/lookup. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
