/**
 * Minimal access-code-gated session for the personalized Dante discovery
 * page (/discovery/dante). This is a private link sent to one person, not a
 * public marketing page — the code keeps it from being viewable by anyone
 * who stumbles on or forwards the URL. Mirrors the lightweight session
 * pattern used for YAN admin (yanAdminAuth.ts): a single shared code, not a
 * full user/role system, using Web Crypto so it runs in both Edge
 * middleware and Node route handlers.
 */
export const DANTE_DISCOVERY_COOKIE = "dante_discovery_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret(): string {
  const secret = process.env.DANTE_DISCOVERY_SESSION_SECRET || process.env.DANTE_DISCOVERY_ACCESS_CODE;
  if (!secret) {
    throw new Error("DANTE_DISCOVERY_SESSION_SECRET (or DANTE_DISCOVERY_ACCESS_CODE) is not configured.");
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
export async function createDiscoverySessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

/** Verifies a session token's signature and expiry. */
export async function isValidDiscoverySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSignature = await sign(payload);
  if (expectedSignature.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    diff |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

/** Constant-time-ish comparison of the submitted access code against the configured one. */
export function isCorrectDiscoveryAccessCode(candidate: string): boolean {
  const expected = process.env.DANTE_DISCOVERY_ACCESS_CODE;
  if (!expected) return false;
  if (candidate.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
