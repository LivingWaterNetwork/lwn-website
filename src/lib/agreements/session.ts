/**
 * Per-agreement signer session. One cookie, scoped to a single agreement by
 * including its id in the signed payload — every API call re-checks that the
 * session's agreementId matches the agreement resolved from the route's slug,
 * so agreement A's session can never be used to read, sign, or download B.
 *
 * Uses Web Crypto (not Node's `crypto`) so the same check runs in both the
 * Edge `middleware.ts` and Node route handlers, mirroring the existing
 * danteDiscoveryAuth.ts / yanAdminAuth.ts pattern.
 */
export const AGREEMENT_SESSION_COOKIE = "agreement_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours, per spec

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

/** Builds a signed session token for one agreement: `<agreementId>.<expiresAtMs>.<signature>`. */
export async function createAgreementSessionToken(agreementId: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${agreementId}.${expiresAt}`;
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

/**
 * Verifies a session token's signature and expiry, and that it belongs to
 * `expectedAgreementId`. Never trust an agreement id from the request body or
 * URL beyond resolving it from the route's own slug — this check is what
 * actually enforces per-agreement isolation.
 */
export async function isValidAgreementSessionToken(
  token: string | undefined | null,
  expectedAgreementId: string
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [agreementId, expiresAtRaw, signature] = parts;

  if (agreementId !== expectedAgreementId) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSignature = await sign(`${agreementId}.${expiresAtRaw}`);
  return constantTimeEqual(expectedSignature, signature);
}

/** Reads the agreement id out of a token without verifying it — only for non-authoritative display use. */
export function unsafeAgreementIdFromToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const [agreementId] = token.split(".");
  return agreementId || null;
}
