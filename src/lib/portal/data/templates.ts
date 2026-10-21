import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { isStaff } from "../auth";

/** Staff-only: every program template, any status — for the read-only /portal/admin/programs list. */
export async function listAllProgramTemplatesForStaff(actor: PortalActor) {
  if (!isStaff(actor)) return null;
  return prisma.portalProgramTemplate.findMany({ orderBy: [{ key: "asc" }, { version: "desc" }] });
}

/** Staff-only: published templates only — for the "create member" picker. */
export async function listPublishedProgramTemplatesForStaff(actor: PortalActor) {
  if (!isStaff(actor)) return null;
  return prisma.portalProgramTemplate.findMany({
    where: { status: "published" },
    orderBy: [{ key: "asc" }, { version: "desc" }],
  });
}

/** Staff-only: every active coach, for assignment dropdowns. */
export async function listCoachesForStaff(actor: PortalActor) {
  if (!isStaff(actor)) return null;
  const roles = await prisma.portalStaffRole.findMany({ where: { role: "coach", revokedAt: null } });
  const personIds = Array.from(new Set(roles.map((r) => r.personId)));
  return prisma.portalPerson.findMany({ where: { id: { in: personIds } }, orderBy: { firstName: "asc" } });
}
