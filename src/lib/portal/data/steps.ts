import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { scopeIncludesEnrollment, getEnrollmentScope } from "../policy";
import { logPortalEvent } from "./events";

const MAX_MEMBER_NOTE_LENGTH = 500;

/** Steps for one enrollment, scoped — returns null if `actor` can't see that enrollment at all. */
export async function listStepsForActor(actor: PortalActor, enrollmentId: string) {
  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  return prisma.portalActionStep.findMany({
    where: { enrollmentId },
    orderBy: [{ order: "asc" }, { dueOn: "asc" }],
  });
}

/**
 * A member ticking/unticking their own step and optionally leaving a short
 * plain-text note. Staff use a separate, broader write path (assign/edit/
 * reorder); this one is deliberately narrow — a member may only toggle
 * status and set memberNote on a step belonging to their own enrollment.
 */
export async function setStepStatusForMember(
  actor: PortalActor,
  stepId: string,
  input: { status: "open" | "done"; memberNote?: string | null }
) {
  const step = await prisma.portalActionStep.findUnique({ where: { id: stepId } });
  if (!step) return null;

  const scope = await getEnrollmentScope(actor);
  if (scope.kind !== "member" || !scopeIncludesEnrollment(scope, step.enrollmentId)) return null;

  const memberNote = input.memberNote?.trim() ?? null;
  if (memberNote && memberNote.length > MAX_MEMBER_NOTE_LENGTH) {
    throw new Error(`memberNote exceeds ${MAX_MEMBER_NOTE_LENGTH} characters`);
  }

  const updated = await prisma.portalActionStep.update({
    where: { id: stepId },
    data: {
      status: input.status,
      doneAt: input.status === "done" ? new Date() : null,
      memberNote,
    },
  });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: "member",
    action: input.status === "done" ? "step_marked_done" : "step_marked_open",
    subjectType: "portal_action_step",
    subjectId: step.id,
    enrollmentId: step.enrollmentId,
  });

  return updated;
}
