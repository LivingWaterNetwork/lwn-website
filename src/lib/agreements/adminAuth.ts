/**
 * Password-gated session for the LWN Agreements admin dashboard
 * (/agreements/admin). Mirrors yanAdminAuth.ts exactly: a single shared
 * password (AGREEMENTS_ADMIN_PASSWORD, set by Omar directly in Vercel — never
 * committed or printed here), HMAC session cookie via Web Crypto so the same
 * check runs in the Edge middleware and in Node route handlers.
 */
export const AGREEMENTS_ADMIN_COOKIE = "agreements_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret(): string {
  const secret = process.env.AGREEMENTS_SESSION_SECRET || process.env.AGREEMENTS_ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("AGREEMENTS_SESSION_SECRET (or AGREEMENTS_ADMIN_PASSWORD) is not configured.");
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

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Builds a signed admin session token: `<expiresAtMs>.<signature>`. */
export async function createAgreementsAdminSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

/** Verifies an admin session token's signature and expiry. */
export async function isValidAgreementsAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSignature = await sign(payload);
  return constantTimeEqual(expectedSignature, signature);
}

/**
 * Returns true if AGREEMENTS_ADMIN_PASSWORD is configured at all. The admin
 * login route checks this first so a missing password produces a clear
 * "ask Omar to set it in Vercel" error instead of a confusing 401.
 */
export function isAgreementsAdminPasswordConfigured(): boolean {
  return Boolean(process.env.AGREEMENTS_ADMIN_PASSWORD);
}

/** Constant-time-ish comparison of the submitted password against the configured one. */
export function isCorrectAgreementsAdminPassword(candidate: string): boolean {
  const expected = process.env.AGREEMENTS_ADMIN_PASSWORD;
  if (!expected) return false;
  if (candidate.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
