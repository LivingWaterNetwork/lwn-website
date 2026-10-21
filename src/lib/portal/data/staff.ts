import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { normalizeEmail } from "../crypto";
import { logPortalEvent } from "./events";
import type { StaffRole } from "../constants";

/** Admin-only: every active staff role, with the person's name/email. */
export async function listStaffForAdmin(actor: PortalActor) {
  if (!actor.isAdmin) return null;

  const roles = await prisma.portalStaffRole.findMany({ where: { revokedAt: null }, orderBy: { grantedAt: "asc" } });
  const personIds = Array.from(new Set(roles.map((r) => r.personId)));
  const persons = await prisma.portalPerson.findMany({ where: { id: { in: personIds } } });
  const personById = new Map(persons.map((p) => [p.id, p]));

  return roles.map((r) => ({ role: r, person: personById.get(r.personId) ?? null }));
}

/** Admin-only: grants a role, creating the person if they don't exist yet. */
export async function grantStaffRoleForAdmin(
  actor: PortalActor,
  input: { email: string; firstName: string; lastName: string; role: StaffRole }
) {
  if (!actor.isAdmin) return null;

  const email = normalizeEmail(input.email);
  const person = await prisma.portalPerson.upsert({
    where: { email },
    create: { email, firstName: input.firstName, lastName: input.lastName, isTest: false },
    update: {},
  });

  const existing = await prisma.portalStaffRole.findFirst({
    where: { personId: person.id, role: input.role, revokedAt: null },
  });
  if (existing) return existing;

  const role = await prisma.portalStaffRole.create({
    data: { personId: person.id, role: input.role, grantedBy: actor.personId },
  });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: "admin",
    action: "staff_role_granted",
    subjectType: "portal_staff_role",
    subjectId: role.id,
    meta: { role: input.role },
  });

  return role;
}

/** Admin-only: revokes a staff role (doesn't delete the person record). */
export async function revokeStaffRoleForAdmin(actor: PortalActor, staffRoleId: string) {
  if (!actor.isAdmin) return null;

  const role = await prisma.portalStaffRole.update({
    where: { id: staffRoleId },
    data: { revokedAt: new Date() },
  });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: "admin",
    action: "staff_role_revoked",
    subjectType: "portal_staff_role",
    subjectId: role.id,
    meta: { role: role.role },
  });

  return role;
}
