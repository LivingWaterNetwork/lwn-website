import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { getEnrollmentScope, scopeIncludesEnrollment } from "../policy";
import { logPortalEvent } from "./events";

/**
 * Returns one enrollment, scoped to what `actor` may see — null (never a
 * thrown 403) if it doesn't exist or isn't in their scope, so callers can
 * return a flat 404 and never leak whether an id exists.
 */
export async function getEnrollmentForActor(actor: PortalActor, enrollmentId: string) {
  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  const enrollment = await prisma.portalEnrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) return null;

  if (scope.kind === "coach" || scope.kind === "partner") {
    // A staff/system write could in principle move coachPersonId/grants out
    // from under a stale scope snapshot mid-request — re-check directly.
    if (scope.kind === "coach" && enrollment.coachPersonId !== actor.personId) return null;
  }

  if (isPrivilegedView(scope.kind)) {
    await logPortalEvent({
      actorPersonId: actor.personId,
      actorRole: scope.kind === "admin" ? "admin" : scope.kind === "coach" ? "coach" : "partner",
      action: "viewed_enrollment",
      subjectType: "portal_enrollment",
      subjectId: enrollment.id,
      enrollmentId: enrollment.id,
    });
  }

  return enrollment;
}

/** Every enrollment `actor` may see, most recent first. */
export async function listEnrollmentsForActor(actor: PortalActor) {
  const scope = await getEnrollmentScope(actor);
  if (scope.kind === "admin") {
    return prisma.portalEnrollment.findMany({ orderBy: { createdAt: "desc" } });
  }
  if (scope.enrollmentIds.length === 0) return [];
  return prisma.portalEnrollment.findMany({
    where: { id: { in: scope.enrollmentIds } },
    orderBy: { createdAt: "desc" },
  });
}

function isPrivilegedView(kind: string): boolean {
  return kind === "admin" || kind === "coach" || kind === "partner";
}
