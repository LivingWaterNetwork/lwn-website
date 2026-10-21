import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { scopeIncludesEnrollment, getEnrollmentScope, canWritePrivateNotes } from "../policy";
import { logPortalEvent } from "./events";

/**
 * Member/partner-safe projection — never selects anything from
 * portal_meeting_private_notes, and never will by construction since this
 * function doesn't join that table at all.
 */
const MEMBER_SAFE_MEETING_SELECT = {
  id: true,
  enrollmentId: true,
  scheduledAt: true,
  durationMin: true,
  format: true,
  status: true,
  countsTowardTotal: true,
  sharedRecap: true,
  recapSharedAt: true,
  createdAt: true,
} as const;

export async function listMeetingsForActor(actor: PortalActor, enrollmentId: string) {
  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  return prisma.portalMeeting.findMany({
    where: { enrollmentId },
    select: MEMBER_SAFE_MEETING_SELECT,
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
  });
}

export async function getMeetingForActor(actor: PortalActor, meetingId: string) {
  const meeting = await prisma.portalMeeting.findUnique({
    where: { id: meetingId },
    select: { ...MEMBER_SAFE_MEETING_SELECT },
  });
  if (!meeting) return null;

  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, meeting.enrollmentId)) return null;

  return meeting;
}

/** Staff adding a session to an enrollment they coach or administer. */
export async function createMeetingForStaff(
  actor: PortalActor,
  enrollmentId: string,
  input: { scheduledAt?: Date | null; durationMin?: number; format?: string }
) {
  if (!canWritePrivateNotes(actor)) return null;
  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  const meeting = await prisma.portalMeeting.create({
    data: {
      enrollmentId,
      scheduledAt: input.scheduledAt ?? null,
      durationMin: input.durationMin ?? 60,
      format: input.format ?? "zoom",
    },
  });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: actor.isAdmin ? "admin" : "coach",
    action: "session_created",
    subjectType: "portal_meeting",
    subjectId: meeting.id,
    enrollmentId,
  });

  return meeting;
}

export interface MeetingUpdateInput {
  scheduledAt?: Date | null;
  durationMin?: number;
  format?: string;
  status?: string;
  countsTowardTotal?: boolean;
  sharedRecap?: string | null;
}

/** Staff-only edit of a session's schedule/status/shared recap. Private notes are a separate call — see addPrivateNoteForStaff. */
export async function updateMeetingForStaff(actor: PortalActor, meetingId: string, input: MeetingUpdateInput) {
  if (!canWritePrivateNotes(actor)) return null; // staff gate — reuses the same "can this person act as coach/admin" check

  const meeting = await prisma.portalMeeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return null;

  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, meeting.enrollmentId)) return null;

  const updated = await prisma.portalMeeting.update({
    where: { id: meetingId },
    data: {
      ...input,
      recapSharedAt: input.sharedRecap !== undefined && input.sharedRecap !== meeting.sharedRecap ? new Date() : undefined,
    },
  });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: actor.isAdmin ? "admin" : "coach",
    action: "session_updated",
    subjectType: "portal_meeting",
    subjectId: meetingId,
    enrollmentId: meeting.enrollmentId,
  });

  return updated;
}

/** Staff-only — private notes are written separately from the shared recap, and never read back except via getMeetingWithPrivateNotesForStaff. */
export async function addPrivateNoteForStaff(actor: PortalActor, meetingId: string, body: string) {
  if (!canWritePrivateNotes(actor)) return null;

  const meeting = await prisma.portalMeeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return null;

  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, meeting.enrollmentId)) return null;

  return prisma.portalMeetingPrivateNote.create({
    data: { meetingId, enrollmentId: meeting.enrollmentId, authorPersonId: actor.personId, body },
  });
}

/** Staff-only: includes private notes, separately selected so a member/partner code path could never accidentally reuse this function. */
export async function getMeetingWithPrivateNotesForStaff(actor: PortalActor, meetingId: string) {
  if (!canWritePrivateNotes(actor)) return null;

  const meeting = await prisma.portalMeeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return null;

  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, meeting.enrollmentId)) return null;

  const notes = await prisma.portalMeetingPrivateNote.findMany({
    where: { meetingId },
    orderBy: { createdAt: "asc" },
  });

  return { meeting, notes };
}
