import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { isStaff } from "../auth";
import { getEnrollmentScope, scopeIncludesEnrollment } from "../policy";
import { normalizeEmail } from "../crypto";

export interface AgreementCandidate {
  id: string;
  slug: string;
  status: string;
  templateTitle: string;
  participantName: string;
  participantEmail: string;
}

/**
 * Staff-only search for Agreements to link to an enrollment, by participant
 * email — the same match `createDraftEnrollmentFromTemplate`'s auto-link
 * uses, just surfaced as a picker instead of an all-or-nothing automatic
 * link. Never returns a voided agreement (nothing to countersign or
 * download from one, and AGENTS.md's immutability note means a voided
 * agreement is meant to be replaced, not pointed at).
 */
export async function searchAgreementsForLinking(
  actor: PortalActor,
  enrollmentId: string,
  email: string
): Promise<AgreementCandidate[] | null> {
  if (!isStaff(actor)) return null;
  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  const normalized = normalizeEmail(email);
  if (!normalized) return [];

  const signers = await prisma.agreementSigner.findMany({
    where: { role: "participant", email: normalized },
    include: { agreement: { include: { template: true } } },
  });

  return signers
    .filter((s) => s.agreement.status !== "voided")
    .map((s) => ({
      id: s.agreement.id,
      slug: s.agreement.slug,
      status: s.agreement.status,
      templateTitle: s.agreement.template.title,
      participantName: s.name,
      participantEmail: s.email,
    }))
    .sort((a, b) => (a.status === b.status ? 0 : a.status === "executed" ? -1 : 1));
}

/** Staff-only: resolves one agreement's display details, for showing what's currently linked. Returns null if the actor can't see the enrollment, or if the agreement doesn't exist. */
export async function getLinkedAgreementSummaryForStaff(
  actor: PortalActor,
  enrollmentId: string,
  agreementId: string
): Promise<AgreementCandidate | null> {
  if (!isStaff(actor)) return null;
  const scope = await getEnrollmentScope(actor);
  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    include: { template: true, signers: { where: { role: "participant" } } },
  });
  if (!agreement) return null;

  const participant = agreement.signers[0];
  return {
    id: agreement.id,
    slug: agreement.slug,
    status: agreement.status,
    templateTitle: agreement.template.title,
    participantName: participant?.name ?? "",
    participantEmail: participant?.email ?? "",
  };
}
