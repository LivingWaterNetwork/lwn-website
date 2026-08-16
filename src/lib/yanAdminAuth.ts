/**
 * Minimal password-gated session for the YAN admin (/yan/admin). This is
 * intentionally lightweight — a single shared password, not a full user/role
 * system — scoped only to YAN content moderation. It reuses Web Crypto
 * (`crypto.subtle`) rather than a new dependency so the same code runs in
 * both the Edge middleware and Node route handlers.
 */
export const YAN_ADMIN_COOKIE = "yan_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret(): string {
  const secret = process.env.YAN_ADMIN_SESSION_SECRET || process.env.YAN_ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("YAN_ADMIN_SESSION_SECRET (or YAN_ADMIN_PASSWORD) is not configured.");
  }
  return secret;
}

function toBase64Url(bytes: ArrayBuffer): string {
  let bin = "";
  new Uint8Array(bytes).forEach((byte) => {
    bin += String.fromCharCode(byte);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(signature);
}

/** Builds a signed session token: `<expiresAtMs>.<signature>`. */
export async function createAdminSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

/** Verifies a session token's signature and expiry. */
export async function isValidAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSignature = await sign(payload);
  // Lengths are fixed (both base64url HMAC-SHA256 digests), so a constant-time
  // compare isn't load-bearing here, but it costs nothing to be careful.
  if (expectedSignature.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    diff |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

/** Constant-time-ish comparison of the submitted password against the configured one. */
export function isCorrectAdminPassword(candidate: string): boolean {
  const expected = process.env.YAN_ADMIN_PASSWORD;
  if (!expected) return false;
  if (candidate.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
