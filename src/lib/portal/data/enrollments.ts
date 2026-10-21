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

/**
 * Switches which enrollment the member's current session shows by default —
 * always scoped to the actor's own personId, regardless of any staff role
 * also held, since this is a member choosing "which of my own programs am
 * I looking at," never a staff action on someone else's enrollment.
 */
export async function setActiveEnrollmentForActor(actor: PortalActor, enrollmentId: string): Promise<boolean> {
  const enrollment = await prisma.portalEnrollment.findFirst({
    where: { id: enrollmentId, personId: actor.personId },
  });
  if (!enrollment) return false;

  await prisma.portalSession.update({
    where: { id: actor.sessionId },
    data: { activeEnrollmentId: enrollment.id },
  });
  return true;
}

/** The enrollment a member-facing page should show: their session's chosen program if set, else the active one, else whatever they have. */
export async function getViewedEnrollmentForActor(actor: PortalActor) {
  const enrollments = await listEnrollmentsForActor(actor);
  if (enrollments.length === 0) return null;
  if (actor.activeEnrollmentId) {
    const chosen = enrollments.find((e) => e.id === actor.activeEnrollmentId);
    if (chosen) return chosen;
  }
  return enrollments.find((e) => e.status === "active") ?? enrollments[0];
}

function isPrivilegedView(kind: string): boolean {
  return kind === "admin" || kind === "coach" || kind === "partner";
}
