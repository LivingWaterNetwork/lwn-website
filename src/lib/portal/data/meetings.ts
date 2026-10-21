import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { scopeIncludesEnrollment, getEnrollmentScope, canWritePrivateNotes } from "../policy";

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
