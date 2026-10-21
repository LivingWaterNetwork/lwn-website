import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { isStaff } from "../auth";

/** Staff-only: a person's basic info, with no enrollment-scoping of its own — callers must already know this personId belongs to an enrollment they're allowed to see. */
export async function getPortalPersonForStaff(actor: PortalActor, personId: string) {
  if (!isStaff(actor)) return null;
  return prisma.portalPerson.findUnique({ where: { id: personId } });
}
