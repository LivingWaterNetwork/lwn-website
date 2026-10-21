import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { scopeIncludesEnrollment, getEnrollmentScope, canWritePrivateNotes } from "../policy";
import { logPortalEvent } from "./events";

/** Partners never see payments at all, in Phase 1 or any future phase — not gated by a module flag, just never. */
export async function listInstallmentsForActor(actor: PortalActor, enrollmentId: string) {
  const scope = await getEnrollmentScope(actor);
  if (scope.kind === "partner") return null;
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  return prisma.portalInstallment.findMany({ where: { enrollmentId }, orderBy: { dueOn: "asc" } });
}

async function staffUpdateInstallment(
  actor: PortalActor,
  installmentId: string,
  action: string,
  data: Record<string, unknown>
) {
  if (!canWritePrivateNotes(actor)) return null;

  const installment = await prisma.portalInstallment.findUnique({ where: { id: installmentId } });
  if (!installment) return null;

  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, installment.enrollmentId)) return null;

  const updated = await prisma.portalInstallment.update({
    where: { id: installmentId },
    data: { ...data, markedBy: actor.personId },
  });

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: actor.isAdmin ? "admin" : "coach",
    action,
    subjectType: "portal_installment",
    subjectId: installmentId,
    enrollmentId: installment.enrollmentId,
  });

  return updated;
}

export function markInstallmentPaidForStaff(actor: PortalActor, installmentId: string, input: { paidOn: Date; note?: string }) {
  return staffUpdateInstallment(actor, installmentId, "installment_marked_paid", {
    status: "paid",
    paidOn: input.paidOn,
    note: input.note ?? null,
  });
}

export function adjustInstallmentForStaff(actor: PortalActor, installmentId: string, input: { dueOn: Date; note: string }) {
  return staffUpdateInstallment(actor, installmentId, "installment_adjusted", {
    status: "adjusted",
    dueOn: input.dueOn,
    note: input.note,
  });
}

export function waiveInstallmentForStaff(actor: PortalActor, installmentId: string, input: { note: string }) {
  return staffUpdateInstallment(actor, installmentId, "installment_waived", {
    status: "waived",
    note: input.note,
  });
}
