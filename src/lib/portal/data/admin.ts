import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { isStaff } from "../auth";
import { getEnrollmentScope } from "../policy";
import { logPortalEvent } from "./events";
import { gatePortalEmail } from "../notify";
import { sendPortalEmail } from "@/lib/email";

export interface DashboardFilter {
  status?: string;
  coachPersonId?: string;
  templateKey?: string;
}

export interface DashboardRow {
  enrollment: Awaited<ReturnType<typeof prisma.portalEnrollment.findFirstOrThrow>>;
  person: { id: string; firstName: string; lastName: string; email: string } | null;
  coach: { id: string; firstName: string; lastName: string } | null;
  flags: { stepsOverdue: boolean; noRecentSession: boolean; installmentPastDue: boolean };
}

const NO_SESSION_THRESHOLD_DAYS = 10;

/** Staff dashboard — coach sees their own members, admin sees everyone. Returns null for a non-staff actor. */
export async function listDashboardRows(actor: PortalActor, filter: DashboardFilter = {}): Promise<DashboardRow[] | null> {
  if (!isStaff(actor)) return null;
  const scope = await getEnrollmentScope(actor);
  if (scope.kind !== "admin" && scope.kind !== "coach") return null;

  const where: Record<string, unknown> = {};
  if (scope.kind === "coach") where.id = { in: scope.enrollmentIds };
  if (filter.status) where.status = filter.status;
  if (filter.coachPersonId) where.coachPersonId = filter.coachPersonId;

  const enrollments = await prisma.portalEnrollment.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const filtered = filter.templateKey
    ? enrollments.filter((e) => (e.templateSnapshot as { key?: string } | null)?.key === filter.templateKey)
    : enrollments;

  const personIds = Array.from(new Set(filtered.map((e) => e.personId)));
  const coachIds = Array.from(new Set(filtered.map((e) => e.coachPersonId).filter((id): id is string => Boolean(id))));
  const [persons, coaches] = await Promise.all([
    prisma.portalPerson.findMany({ where: { id: { in: personIds } } }),
    prisma.portalPerson.findMany({ where: { id: { in: coachIds } } }),
  ]);
  const personById = new Map(persons.map((p) => [p.id, p]));
  const coachById = new Map(coaches.map((c) => [c.id, c]));

  const now = new Date();
  const staleSince = new Date(now.getTime() - NO_SESSION_THRESHOLD_DAYS * 86400000);

  return Promise.all(
    filtered.map(async (enrollment) => {
      const [overdueSteps, lastHeld, pastDueInstallment] = await Promise.all([
        prisma.portalActionStep.count({ where: { enrollmentId: enrollment.id, status: "open", dueOn: { lt: now } } }),
        prisma.portalMeeting.findFirst({
          where: { enrollmentId: enrollment.id, status: "held" },
          orderBy: { scheduledAt: "desc" },
        }),
        prisma.portalInstallment.findFirst({
          where: { enrollmentId: enrollment.id, status: "due", dueOn: { lt: now } },
        }),
      ]);

      const noRecentSession =
        enrollment.status === "active" && (!lastHeld?.scheduledAt || lastHeld.scheduledAt < staleSince);

      const person = personById.get(enrollment.personId) ?? null;
      const coach = enrollment.coachPersonId ? (coachById.get(enrollment.coachPersonId) ?? null) : null;

      return {
        enrollment,
        person: person ? { id: person.id, firstName: person.firstName, lastName: person.lastName, email: person.email } : null,
        coach: coach ? { id: coach.id, firstName: coach.firstName, lastName: coach.lastName } : null,
        flags: {
          stepsOverdue: overdueSteps > 0,
          noRecentSession,
          installmentPastDue: Boolean(pastDueInstallment),
        },
      };
    })
  );
}

export interface EnrollmentUpdateInput {
  coachPersonId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  currentPhaseKey?: string | null;
  modules?: Record<string, boolean>;
  agreementId?: string | null;
  paymentUrl?: string | null;
}

/** Staff-only edit of enrollment-level fields — phases/dates/modules/current phase/agreement link/payment link. */
export async function updateEnrollmentForStaff(actor: PortalActor, enrollmentId: string, input: EnrollmentUpdateInput) {
  if (!isStaff(actor)) return null;
  const scope = await getEnrollmentScope(actor);
  if (scope.kind === "coach" && !scope.enrollmentIds.includes(enrollmentId)) return null;

  if (input.agreementId) {
    const agreement = await prisma.agreement.findUnique({ where: { id: input.agreementId } });
    if (!agreement) throw new Error("That agreement no longer exists.");
    if (agreement.status === "voided") throw new Error("That agreement has been voided — link the one that replaced it instead.");
  }

  const updated = await prisma.portalEnrollment.update({ where: { id: enrollmentId }, data: input });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: actor.isAdmin ? "admin" : "coach",
    action: "enrollment_updated",
    subjectType: "portal_enrollment",
    subjectId: enrollmentId,
    enrollmentId,
  });

  return updated;
}

/** Pause / complete / archive — the three lifecycle transitions staff can trigger directly. */
export async function setEnrollmentStatusForStaff(
  actor: PortalActor,
  enrollmentId: string,
  status: "active" | "paused" | "completed" | "archived"
) {
  if (!isStaff(actor)) return null;
  const scope = await getEnrollmentScope(actor);
  if (scope.kind === "coach" && !scope.enrollmentIds.includes(enrollmentId)) return null;

  const updated = await prisma.portalEnrollment.update({
    where: { id: enrollmentId },
    data: { status, archivedAt: status === "archived" ? new Date() : undefined },
  });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: actor.isAdmin ? "admin" : "coach",
    action: `enrollment_${status}`,
    subjectType: "portal_enrollment",
    subjectId: enrollmentId,
    enrollmentId,
  });

  return updated;
}

/**
 * "Send sign-in email" — works only for a non-test member, only in
 * production, per the portal's QA rules. Returns why it refused when it
 * does, so the admin UI can show a clear reason instead of a silent no-op.
 */
export async function inviteMemberForStaff(
  actor: PortalActor,
  enrollmentId: string
): Promise<{ sent: true } | { sent: false; reason: string }> {
  if (!isStaff(actor)) return { sent: false, reason: "Not authorized." };

  const enrollment = await prisma.portalEnrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) return { sent: false, reason: "Not found." };

  const scope = await getEnrollmentScope(actor);
  if (scope.kind === "coach" && !scope.enrollmentIds.includes(enrollmentId)) return { sent: false, reason: "Not found." };

  if (enrollment.isTest) return { sent: false, reason: "This is a test record — sign-in emails are never sent for test records." };
  if (process.env.VERCEL_ENV !== "production") {
    return { sent: false, reason: "Sign-in invites only send from Production." };
  }

  const person = await prisma.portalPerson.findUnique({ where: { id: enrollment.personId } });
  if (!person) return { sent: false, reason: "Not found." };

  const gate = gatePortalEmail({ email: person.email, isTest: person.isTest });
  if (!gate.send) return { sent: false, reason: "This address can't receive real email right now." };

  await sendPortalEmail({
    to: person.email,
    subject: "Your LWN member space is ready",
    text: `Hi ${person.firstName}! Your LWN member space is ready. Go to ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lwnetwork.org"}/portal, enter your email, and we'll send you a code to sign in. No password needed.`,
  });

  await prisma.portalEnrollment.update({ where: { id: enrollmentId }, data: { invitedAt: new Date(), status: "invited" } });
  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: actor.isAdmin ? "admin" : "coach",
    action: "member_invited",
    subjectType: "portal_enrollment",
    subjectId: enrollmentId,
    enrollmentId,
  });

  return { sent: true };
}

/** That member's audit events for the Activity tab. */
export async function listEnrollmentActivityForStaff(actor: PortalActor, enrollmentId: string) {
  if (!isStaff(actor)) return null;
  const scope = await getEnrollmentScope(actor);
  if (scope.kind === "coach" && !scope.enrollmentIds.includes(enrollmentId)) return null;

  return prisma.portalEvent.findMany({ where: { enrollmentId }, orderBy: { at: "desc" } });
}
