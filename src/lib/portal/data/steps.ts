import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { scopeIncludesEnrollment, getEnrollmentScope, canWritePrivateNotes } from "../policy";
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

/** Steps created from a particular session, scoped — null if `actor` can't see the owning enrollment. */
export async function listStepsForMeeting(actor: PortalActor, enrollmentId: string, meetingId: string) {
  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  return prisma.portalActionStep.findMany({
    where: { enrollmentId, meetingId },
    orderBy: { order: "asc" },
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

export interface StaffStepInput {
  title: string;
  detail?: string | null;
  phaseKey?: string | null;
  meetingId?: string | null;
  dueOn?: Date | null;
  tags?: string[];
  order?: number;
}

/** Staff creating/assigning a step on an enrollment they coach or administer. */
export async function createStepForStaff(actor: PortalActor, enrollmentId: string, input: StaffStepInput) {
  if (!canWritePrivateNotes(actor)) return null; // staff-only gate
  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  const step = await prisma.portalActionStep.create({
    data: {
      enrollmentId,
      title: input.title,
      detail: input.detail ?? null,
      phaseKey: input.phaseKey ?? null,
      meetingId: input.meetingId ?? null,
      dueOn: input.dueOn ?? null,
      tags: input.tags ?? [],
      order: input.order ?? 0,
      createdBy: actor.personId,
    },
  });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: actor.isAdmin ? "admin" : "coach",
    action: "step_created",
    subjectType: "portal_action_step",
    subjectId: step.id,
    enrollmentId,
  });

  return step;
}

/** Staff editing/reordering an existing step (title, dates, tags, order) — distinct from a member's own narrow status+note toggle. */
export async function updateStepForStaff(actor: PortalActor, stepId: string, input: Partial<StaffStepInput>) {
  if (!canWritePrivateNotes(actor)) return null;

  const step = await prisma.portalActionStep.findUnique({ where: { id: stepId } });
  if (!step) return null;

  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, step.enrollmentId)) return null;

  const updated = await prisma.portalActionStep.update({ where: { id: stepId }, data: input });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: actor.isAdmin ? "admin" : "coach",
    action: "step_updated",
    subjectType: "portal_action_step",
    subjectId: stepId,
    enrollmentId: step.enrollmentId,
  });

  return updated;
}

/**
 * Staff reordering an enrollment's steps. `orderedStepIds` must be exactly
 * the set of step ids currently on this enrollment, in the new order —
 * anything else (an id from a different enrollment, a partial list) is
 * refused rather than silently reordering a subset. Each step's `order` is
 * set to its index in the array, in one transaction.
 */
export async function reorderStepsForStaff(
  actor: PortalActor,
  enrollmentId: string,
  orderedStepIds: string[]
): Promise<boolean> {
  if (!canWritePrivateNotes(actor)) return false;
  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return false;

  const existing = await prisma.portalActionStep.findMany({
    where: { enrollmentId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((s) => s.id));
  const requestedIds = new Set(orderedStepIds);

  if (existingIds.size !== requestedIds.size || existing.some((s) => !requestedIds.has(s.id))) {
    return false;
  }

  await prisma.$transaction(
    orderedStepIds.map((id, index) =>
      prisma.portalActionStep.update({ where: { id }, data: { order: index } })
    )
  );

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: actor.isAdmin ? "admin" : "coach",
    action: "steps_reordered",
    subjectType: "portal_enrollment",
    subjectId: enrollmentId,
    enrollmentId,
  });

  return true;
}
