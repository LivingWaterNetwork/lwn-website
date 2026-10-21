import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { normalizeEmail } from "../crypto";
import { logPortalEvent } from "./events";
import { getEnrollmentScope, scopeIncludesEnrollment } from "../policy";
import type { PartnerGrantableModule } from "../constants";
import { isPartnerGrantableModule } from "../constants";

/** Admin-only: every partner org with its active users. */
export async function listPartnerOrgsForAdmin(actor: PortalActor) {
  if (!actor.isAdmin) return null;

  const orgs = await prisma.portalPartnerOrg.findMany({ orderBy: { createdAt: "asc" } });
  const users = await prisma.portalPartnerUser.findMany({ where: { revokedAt: null } });
  const personIds = Array.from(new Set(users.map((u) => u.personId)));
  const persons = await prisma.portalPerson.findMany({ where: { id: { in: personIds } } });
  const personById = new Map(persons.map((p) => [p.id, p]));

  return orgs.map((org) => ({
    org,
    users: users.filter((u) => u.partnerOrgId === org.id).map((u) => ({ user: u, person: personById.get(u.personId) ?? null })),
  }));
}

export async function createPartnerOrgForAdmin(actor: PortalActor, input: { key: string; name: string }) {
  if (!actor.isAdmin) return null;
  const org = await prisma.portalPartnerOrg.create({ data: { key: input.key, name: input.name } });
  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: "admin",
    action: "partner_org_created",
    subjectType: "portal_partner_org",
    subjectId: org.id,
  });
  return org;
}

export async function addPartnerUserForAdmin(
  actor: PortalActor,
  input: { partnerOrgId: string; email: string; firstName: string; lastName: string }
) {
  if (!actor.isAdmin) return null;

  const email = normalizeEmail(input.email);
  const person = await prisma.portalPerson.upsert({
    where: { email },
    create: { email, firstName: input.firstName, lastName: input.lastName, isTest: false },
    update: {},
  });

  const user = await prisma.portalPartnerUser.create({
    data: { personId: person.id, partnerOrgId: input.partnerOrgId },
  });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: "admin",
    action: "partner_user_added",
    subjectType: "portal_partner_user",
    subjectId: user.id,
  });

  return user;
}

export async function revokePartnerUserForAdmin(actor: PortalActor, partnerUserId: string) {
  if (!actor.isAdmin) return null;
  const user = await prisma.portalPartnerUser.update({ where: { id: partnerUserId }, data: { revokedAt: new Date() } });
  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: "admin",
    action: "partner_user_revoked",
    subjectType: "portal_partner_user",
    subjectId: user.id,
  });
  return user;
}

export interface GrantPartnerAccessInput {
  enrollmentId: string;
  partnerOrgId: string;
  modules: PartnerGrantableModule[];
  grantedVia: "member" | "coach_with_consent";
}

/**
 * Staff can grant partner access, but only with written member consent
 * logged (`coach_with_consent`) — the UI must require that checkbox before
 * calling this with that value. A member granting their own access calls
 * this with `grantedVia: "member"` through a member-facing route (not
 * built in Phase 1's admin UI, but the data function supports either).
 */
export async function grantPartnerAccessForStaff(actor: PortalActor, input: GrantPartnerAccessInput) {
  const scope = await getEnrollmentScope(actor);
  if (scope.kind !== "admin" && scope.kind !== "coach") return null;
  if (!scopeIncludesEnrollment(scope, input.enrollmentId)) return null;

  const modules = input.modules.filter(isPartnerGrantableModule);

  const grant = await prisma.portalPartnerGrant.create({
    data: {
      enrollmentId: input.enrollmentId,
      partnerOrgId: input.partnerOrgId,
      modules,
      grantedByPersonId: actor.personId,
      grantedVia: input.grantedVia,
    },
  });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: actor.isAdmin ? "admin" : "coach",
    action: "partner_grant_created",
    subjectType: "portal_partner_grant",
    subjectId: grant.id,
    enrollmentId: input.enrollmentId,
    meta: { grantedVia: input.grantedVia, modules },
  });

  return grant;
}

export async function revokePartnerGrantForStaff(actor: PortalActor, grantId: string) {
  const grant = await prisma.portalPartnerGrant.findUnique({ where: { id: grantId } });
  if (!grant) return null;

  const scope = await getEnrollmentScope(actor);
  if (scope.kind !== "admin" && scope.kind !== "coach") return null;
  if (!scopeIncludesEnrollment(scope, grant.enrollmentId)) return null;

  const updated = await prisma.portalPartnerGrant.update({ where: { id: grantId }, data: { revokedAt: new Date() } });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: actor.isAdmin ? "admin" : "coach",
    action: "partner_grant_revoked",
    subjectType: "portal_partner_grant",
    subjectId: grantId,
    enrollmentId: grant.enrollmentId,
  });

  return updated;
}

/** Grants for one enrollment, staff-visible (never for a partner actor — they have no reason to see this list). */
export async function listPartnerGrantsForStaff(actor: PortalActor, enrollmentId: string) {
  const scope = await getEnrollmentScope(actor);
  if (scope.kind !== "admin" && scope.kind !== "coach") return null;
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  return prisma.portalPartnerGrant.findMany({ where: { enrollmentId }, orderBy: { grantedAt: "desc" } });
}
