import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PORTAL_SESSION_COOKIE, resolvePortalSession } from "./session";
import type { StaffRole } from "./constants";

export interface PortalActor {
  personId: string;
  sessionId: string;
  activeEnrollmentId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  staffRoles: StaffRole[];
  isCoach: boolean;
  isAdmin: boolean;
  partnerOrgIds: string[];
}

/**
 * Resolves the current actor from the `lwn_portal` cookie. Returns null for
 * anyone without a valid, unexpired, unrevoked session — callers decide
 * whether that means redirecting to /portal/login or a 401/404.
 *
 * This is the one place that turns a cookie into an identity; everything
 * downstream (lib/portal/policy.ts, lib/portal/data/*) takes a PortalActor,
 * never a raw request or cookie.
 */
export async function getPortalActor(): Promise<PortalActor | null> {
  const rawToken = cookies().get(PORTAL_SESSION_COOKIE)?.value;
  const session = await resolvePortalSession(rawToken);
  if (!session) return null;

  const person = await prisma.portalPerson.findUnique({ where: { id: session.personId } });
  if (!person || person.status !== "active") return null;

  const [staffRoles, partnerUsers] = await Promise.all([
    prisma.portalStaffRole.findMany({
      where: { personId: person.id, revokedAt: null },
      select: { role: true },
    }),
    prisma.portalPartnerUser.findMany({
      where: { personId: person.id, revokedAt: null },
      select: { partnerOrgId: true },
    }),
  ]);

  const roles = staffRoles.map((r) => r.role as StaffRole);

  return {
    personId: person.id,
    sessionId: session.sessionId,
    activeEnrollmentId: session.activeEnrollmentId,
    firstName: person.firstName,
    lastName: person.lastName,
    email: person.email,
    staffRoles: roles,
    isCoach: roles.includes("coach"),
    isAdmin: roles.includes("admin"),
    partnerOrgIds: partnerUsers.map((p) => p.partnerOrgId),
  };
}

/** Whether this person has any staff role at all (coach or admin). */
export function isStaff(actor: PortalActor): boolean {
  return actor.isCoach || actor.isAdmin;
}

/** Whether this person is a partner-org user (and not also staff — staff/partner are kept distinct roles). */
export function isPartner(actor: PortalActor): boolean {
  return actor.partnerOrgIds.length > 0;
}
