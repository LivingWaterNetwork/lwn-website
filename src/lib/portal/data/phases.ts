import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { scopeIncludesEnrollment, getEnrollmentScope } from "../policy";

export async function listPhasesForActor(actor: PortalActor, enrollmentId: string) {
  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  return prisma.portalPhase.findMany({ where: { enrollmentId }, orderBy: { order: "asc" } });
}
