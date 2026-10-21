import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { isStaff } from "../auth";

/** Staff-only: a person's basic info, with no enrollment-scoping of its own — callers must already know this personId belongs to an enrollment they're allowed to see. */
export async function getPortalPersonForStaff(actor: PortalActor, personId: string) {
  if (!isStaff(actor)) return null;
  return prisma.portalPerson.findUnique({ where: { id: personId } });
}

/**
 * Ungated bootstrap lookup — no actor, by design: used only to verify a
 * test-only record before minting it a sign-in code outside the normal
 * login flow (mirrors scripts/portal-test-login.ts's own refusal of any
 * non-test record). Never call this from anywhere an ordinary actor
 * request could reach.
 */
export async function bootstrapFindPersonByEmail(email: string) {
  return prisma.portalPerson.findUnique({ where: { email } });
}
