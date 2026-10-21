import { prisma } from "@/lib/prisma";
import { generateSessionToken, getPortalSecret, hmacHex } from "./crypto";

export const PORTAL_SESSION_COOKIE = "lwn_portal";
export const MEMBER_SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days, rolling
export const STAFF_SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours — anyone with a staff or partner role

export interface CreatedPortalSession {
  rawToken: string;
  sessionId: string;
  expiresAt: Date;
}

/**
 * Creates a portal session row. `tokenHash` is HMAC-SHA256(PORTAL_SESSION_SECRET, rawToken) —
 * not a plain hash — so that rotating PORTAL_SESSION_SECRET changes what any
 * presented token hashes to and every existing row stops matching at once.
 * That's the whole invalidation mechanism; nothing else needs to run for a
 * secret rotation to take effect.
 */
export async function createPortalSession(params: {
  personId: string;
  isPrivileged: boolean; // true if the person holds a staff or partner role
  ip?: string | null;
  userAgent?: string | null;
}): Promise<CreatedPortalSession> {
  const rawToken = generateSessionToken();
  const tokenHash = hmacHex(getPortalSecret(), rawToken);
  const ttl = params.isPrivileged ? STAFF_SESSION_TTL_MS : MEMBER_SESSION_TTL_MS;
  const expiresAt = new Date(Date.now() + ttl);

  const session = await prisma.portalSession.create({
    data: {
      tokenHash,
      personId: params.personId,
      expiresAt,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
    },
  });

  return { rawToken, sessionId: session.id, expiresAt };
}

export interface ResolvedPortalSession {
  sessionId: string;
  personId: string;
  activeEnrollmentId: string | null;
}

/**
 * Resolves a raw session token from the `lwn_portal` cookie to its DB row,
 * or null if it's missing, expired, revoked, or hashes to nothing under the
 * *current* secret (which is what makes a secret rotation invalidate every
 * session immediately, including ones minted during QA).
 */
export async function resolvePortalSession(rawToken: string | undefined | null): Promise<ResolvedPortalSession | null> {
  if (!rawToken) return null;

  let tokenHash: string;
  try {
    tokenHash = hmacHex(getPortalSecret(), rawToken);
  } catch {
    return null;
  }

  const session = await prisma.portalSession.findUnique({ where: { tokenHash } });
  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;

  await prisma.portalSession.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  });

  return {
    sessionId: session.id,
    personId: session.personId,
    activeEnrollmentId: session.activeEnrollmentId,
  };
}

/** "Sign out" — revokes a single session. */
export async function revokePortalSession(sessionId: string): Promise<void> {
  await prisma.portalSession.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

/** "Sign out everywhere" — revokes every active session for a person. */
export async function revokeAllPortalSessionsForPerson(personId: string): Promise<void> {
  await prisma.portalSession.updateMany({
    where: { personId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export const portalSessionCookieOptions = (expiresAt: Date) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  expires: expiresAt,
});
