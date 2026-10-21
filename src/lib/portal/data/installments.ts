import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { scopeIncludesEnrollment, getEnrollmentScope } from "../policy";

/** Partners never see payments at all, in Phase 1 or any future phase — not gated by a module flag, just never. */
export async function listInstallmentsForActor(actor: PortalActor, enrollmentId: string) {
  const scope = await getEnrollmentScope(actor);
  if (scope.kind === "partner") return null;
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  return prisma.portalInstallment.findMany({ where: { enrollmentId }, orderBy: { dueOn: "asc" } });
}
