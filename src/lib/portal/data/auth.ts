import { prisma } from "@/lib/prisma";
import type { PortalPerson } from "@prisma/client";
import {
  constantTimeEqualHex,
  generateLinkToken,
  generateLoginCode,
  getPortalSecret,
  hmacHex,
  normalizeEmail,
} from "../crypto";
import {
  CODE_TTL_MS,
  evaluateCodeRequestThrottle,
  evaluateCodeVerifyAttempt,
  type ThrottleState,
} from "../access";
import { logPortalEvent } from "./events";

export interface StartLoginResult {
  code: string;
  linkToken: string;
  person: PortalPerson | null;
}

/**
 * Creates a login challenge and updates the per-email request throttle.
 * Always does the same work — writes a throttle row and (usually) a
 * challenge row — whether or not the email has an account, so the response
 * shape/timing can never reveal account existence. Returns `person: null`
 * for an unknown email or a throttled request; the caller must still send
 * the client the identical generic response either way, and only actually
 * emails someone when `person` is non-null.
 */
export async function startPortalLogin(
  email: string,
  ip: string | null,
  userAgent: string | null
): Promise<StartLoginResult> {
  const normalized = normalizeEmail(email);
  const secret = getPortalSecret();
  const emailHash = hmacHex(secret, normalized);
  const now = new Date();

  const throttleKey = `request:${emailHash}`;
  const throttleRow = await prisma.portalLoginThrottle.findUnique({ where: { key: throttleKey } });
  const state: ThrottleState | null = throttleRow
    ? { windowStart: throttleRow.windowStart, count: throttleRow.count, lockedUntil: throttleRow.lockedUntil }
    : null;
  const decision = evaluateCodeRequestThrottle(state, now);

  await prisma.portalLoginThrottle.upsert({
    where: { key: throttleKey },
    create: {
      key: throttleKey,
      windowStart: decision.next.windowStart,
      count: decision.next.count,
      lockedUntil: decision.next.lockedUntil,
    },
    update: {
      windowStart: decision.next.windowStart,
      count: decision.next.count,
      lockedUntil: decision.next.lockedUntil,
    },
  });

  const code = generateLoginCode();
  const linkToken = generateLinkToken();

  if (!decision.allowed) {
    return { code, linkToken, person: null };
  }

  const codeHash = hmacHex(secret, code);
  const linkTokenHash = hmacHex(secret, linkToken);
  const person = await prisma.portalPerson.findUnique({ where: { email: normalized } });
  const activePerson = person && person.status === "active" ? person : null;

  await prisma.portalLoginChallenge.create({
    data: {
      emailHash,
      personId: activePerson?.id ?? null,
      codeHash,
      linkTokenHash,
      expiresAt: new Date(now.getTime() + CODE_TTL_MS),
      ip,
      userAgent,
    },
  });

  if (activePerson) {
    const person = activePerson;
    await logPortalEvent({
      actorPersonId: person.id,
      actorRole: "member",
      action: "login_code_requested",
      subjectType: "portal_person",
      subjectId: person.id,
      ip,
      userAgent,
    });
    return { code, linkToken, person };
  }

  return { code, linkToken, person: null };
}

export type VerifyLoginOutcome =
  | { outcome: "accepted"; person: PortalPerson }
  | { outcome: "locked" }
  | { outcome: "rejected" };

async function recordLockout(emailHash: string, lockedUntil: Date): Promise<void> {
  const lockKey = `lockout:${emailHash}`;
  await prisma.portalLoginThrottle.upsert({
    where: { key: lockKey },
    create: { key: lockKey, windowStart: new Date(), count: 0, lockedUntil },
    update: { lockedUntil },
  });
}

async function getActiveLockout(emailHash: string, now: Date): Promise<Date | null> {
  const row = await prisma.portalLoginThrottle.findUnique({ where: { key: `lockout:${emailHash}` } });
  if (row?.lockedUntil && row.lockedUntil.getTime() > now.getTime()) return row.lockedUntil;
  return null;
}

/**
 * Verifies a 6-digit code against the most recent unused challenge for an
 * email. "Wrong code", "expired", "already used", and "unknown email" all
 * collapse to the same `rejected` outcome for the caller to turn into one
 * generic client message — never distinguish them externally.
 */
export async function verifyPortalLoginCode(params: {
  email: string;
  code: string;
  ip: string | null;
  userAgent: string | null;
}): Promise<VerifyLoginOutcome> {
  const normalized = normalizeEmail(params.email);
  const secret = getPortalSecret();
  const emailHash = hmacHex(secret, normalized);
  const now = new Date();

  const existingLockout = await getActiveLockout(emailHash, now);

  const challenge = await prisma.portalLoginChallenge.findFirst({
    where: { emailHash, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const codeHashCandidate = hmacHex(secret, params.code);
  const codeMatches = Boolean(challenge) && constantTimeEqualHex(codeHashCandidate, challenge!.codeHash);

  const state = {
    attempts: challenge?.attempts ?? 0,
    expiresAt: challenge?.expiresAt ?? new Date(0),
    usedAt: challenge?.usedAt ?? null,
  };

  const decision = evaluateCodeVerifyAttempt(state, codeMatches, now, existingLockout);

  if (decision.outcome === "locked_out") {
    return { outcome: "locked" };
  }

  if (decision.outcome === "accepted") {
    await prisma.portalLoginChallenge.update({ where: { id: challenge!.id }, data: { usedAt: now } });
    const person = await prisma.portalPerson.findUnique({ where: { email: normalized } });
    if (!person || person.status !== "active") return { outcome: "rejected" };
    await logPortalEvent({
      actorPersonId: person.id,
      actorRole: "member",
      action: "login_succeeded",
      subjectType: "portal_person",
      subjectId: person.id,
      ip: params.ip,
      userAgent: params.userAgent,
    });
    return { outcome: "accepted", person };
  }

  if (decision.outcome === "expired" || decision.outcome === "already_used") {
    return { outcome: "rejected" };
  }

  // wrong_code
  if (challenge) {
    await prisma.portalLoginChallenge.update({ where: { id: challenge.id }, data: { attempts: decision.attempts } });
  }

  if (decision.lockedUntil) {
    await recordLockout(emailHash, decision.lockedUntil);
    const person = await prisma.portalPerson.findUnique({ where: { email: normalized } });
    if (person) {
      await logPortalEvent({
        actorPersonId: person.id,
        actorRole: "member",
        action: "login_locked_out",
        subjectType: "portal_person",
        subjectId: person.id,
        ip: params.ip,
        userAgent: params.userAgent,
      });
    }
    return { outcome: "locked" };
  }

  return { outcome: "rejected" };
}

/** Same outcome shape as code verification, for the magic-link "Continue" POST. */
export async function verifyPortalLoginLink(params: {
  token: string;
  ip: string | null;
  userAgent: string | null;
}): Promise<VerifyLoginOutcome> {
  const secret = getPortalSecret();
  const tokenHash = hmacHex(secret, params.token);
  const now = new Date();

  const challenge = await prisma.portalLoginChallenge.findFirst({
    where: { linkTokenHash: tokenHash, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge || challenge.expiresAt.getTime() <= now.getTime()) {
    return { outcome: "rejected" };
  }

  const existingLockout = await getActiveLockout(challenge.emailHash, now);
  if (existingLockout) return { outcome: "locked" };

  if (!challenge.personId) return { outcome: "rejected" };

  const person = await prisma.portalPerson.findUnique({ where: { id: challenge.personId } });
  if (!person || person.status !== "active") return { outcome: "rejected" };

  await prisma.portalLoginChallenge.update({ where: { id: challenge.id }, data: { usedAt: now } });
  await logPortalEvent({
    actorPersonId: person.id,
    actorRole: "member",
    action: "login_succeeded",
    subjectType: "portal_person",
    subjectId: person.id,
    ip: params.ip,
    userAgent: params.userAgent,
  });
  return { outcome: "accepted", person };
}

/** True if this person currently holds any staff role or any active partner-org membership — used to pick the session TTL. */
export async function isPersonPrivileged(personId: string): Promise<boolean> {
  const [staffCount, partnerCount] = await Promise.all([
    prisma.portalStaffRole.count({ where: { personId, revokedAt: null } }),
    prisma.portalPartnerUser.count({ where: { personId, revokedAt: null } }),
  ]);
  return staffCount > 0 || partnerCount > 0;
}
