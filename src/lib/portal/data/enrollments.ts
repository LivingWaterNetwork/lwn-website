import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { getEnrollmentScope, scopeIncludesEnrollment } from "../policy";
import { logPortalEvent } from "./events";
import { normalizeEmail } from "../crypto";
import { programTemplateBodySchema } from "../programTemplates";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export interface CreateDraftEnrollmentInput {
  personEmail: string;
  personFirstName: string;
  personLastName: string;
  isTest?: boolean;
  templateKey: string;
  templateVersion?: string; // defaults to the latest published version
  coachPersonId?: string | null;
  startDate: Date;
  endDate?: Date | null;
  paymentUrl?: string | null;
}

export type AgreementLinkResult = "linked" | "none" | "ambiguous";

/**
 * The one shared path for creating a draft enrollment — used by both the
 * admin "Create a member" form and `scripts/portal-enroll.ts`, so the two
 * never drift (same precedent as Agreements' createAgreementFromTemplate).
 * Always creates `draft` status and never sends anything.
 */
export async function createDraftEnrollmentFromTemplate(
  input: CreateDraftEnrollmentInput
): Promise<{ enrollmentId: string; agreementLink: AgreementLinkResult }> {
  const email = normalizeEmail(input.personEmail);
  const isTest = input.isTest ?? false;

  const templateRow = input.templateVersion
    ? await prisma.portalProgramTemplate.findUnique({
        where: { key_version: { key: input.templateKey, version: input.templateVersion } },
      })
    : await prisma.portalProgramTemplate.findFirst({
        where: { key: input.templateKey, status: "published" },
        orderBy: { version: "desc" },
      });
  if (!templateRow) {
    throw new Error(
      `No ${input.templateVersion ? "" : "published "}template found for ${input.templateKey}${
        input.templateVersion ? "@" + input.templateVersion : ""
      }.`
    );
  }
  const template = programTemplateBodySchema.parse(templateRow.body);

  const person = await prisma.portalPerson.upsert({
    where: { email },
    create: { email, firstName: input.personFirstName, lastName: input.personLastName, isTest },
    update: {},
  });

  let agreementId: string | null = null;
  let agreementLink: AgreementLinkResult = "none";
  if (template.agreementTemplateKey) {
    const signers = await prisma.agreementSigner.findMany({
      where: { role: "participant", email },
      select: { agreementId: true },
    });
    const uniqueAgreementIds = Array.from(new Set(signers.map((s) => s.agreementId)));
    if (uniqueAgreementIds.length === 1) {
      agreementId = uniqueAgreementIds[0];
      agreementLink = "linked";
    } else if (uniqueAgreementIds.length > 1) {
      agreementLink = "ambiguous";
    }
  }

  let installmentsFromAgreement: Array<{ label: string; due: string; amount: number }> = [];
  if (agreementId) {
    const agreement = await prisma.agreement.findUnique({ where: { id: agreementId } });
    const raw = (agreement?.variables as Record<string, unknown> | undefined)?.installments;
    if (Array.isArray(raw)) installmentsFromAgreement = raw as typeof installmentsFromAgreement;
  }

  const modules = Object.fromEntries(template.modules.map((m) => [m, true]));

  const enrollment = await prisma.portalEnrollment.create({
    data: {
      personId: person.id,
      templateId: templateRow.id,
      templateSnapshot: templateRow.body as object,
      coachPersonId: input.coachPersonId ?? null,
      status: "draft",
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      currentPhaseKey: template.phases[0]?.key ?? null,
      modules,
      agreementId,
      paymentUrl: input.paymentUrl ?? null,
      isTest,
    },
  });

  await prisma.portalPhase.createMany({
    data: template.phases.map((phase, i) => ({
      enrollmentId: enrollment.id,
      key: phase.key,
      title: phase.title,
      summary: phase.summary,
      order: i,
    })),
  });

  await prisma.portalMeeting.createMany({
    data: Array.from({ length: template.expectedSessions.count }, () => ({
      enrollmentId: enrollment.id,
      durationMin: template.expectedSessions.durationMin,
      format: "zoom",
      status: "scheduled",
    })),
  });

  await prisma.portalActionStep.createMany({
    data: template.defaultSteps.map((step, i) => ({
      enrollmentId: enrollment.id,
      phaseKey: step.phaseKey ?? null,
      title: step.title,
      detail: step.detail ?? null,
      dueOn: addDays(input.startDate, step.dayOffset),
      tags: step.tags,
      order: i,
      createdBy: person.id,
    })),
  });

  if (modules.payments && installmentsFromAgreement.length > 0) {
    await prisma.portalInstallment.createMany({
      data: installmentsFromAgreement.map((inst) => ({
        enrollmentId: enrollment.id,
        label: inst.label,
        dueOn: new Date(inst.due),
        amountCents: Math.round(inst.amount * 100),
      })),
    });
  }

  return { enrollmentId: enrollment.id, agreementLink };
}

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

  // A staff write could in principle move coachPersonId out from under a
  // stale scope snapshot mid-request (scope was built from a findMany just
  // above) — re-check the coach relationship directly against the fetched
  // row rather than trusting scope.enrollmentIds alone.
  if (scope.kind === "coach" && enrollment.coachPersonId !== actor.personId) return null;

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

/**
 * Used only by the Agreements "Continue to your LWN space" handoff — tells
 * the signer-facing done screen whether this agreement is linked to a
 * portal enrollment at all. No portal data beyond that boolean is ever
 * exposed to the Agreements side.
 */
export async function isAgreementLinkedToAnEnrollment(agreementId: string): Promise<boolean> {
  const enrollment = await prisma.portalEnrollment.findFirst({ where: { agreementId }, select: { id: true } });
  return Boolean(enrollment);
}

function isPrivilegedView(kind: string): boolean {
  return kind === "admin" || kind === "coach" || kind === "partner";
}
