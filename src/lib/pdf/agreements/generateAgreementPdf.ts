import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { fillSystemTokens } from "@/lib/agreements/render";
import { computeEffectiveDate } from "@/lib/agreements/effectiveDate";
import { sha256Hex } from "@/lib/agreements/crypto";
import { AgreementPdf, type AgreementPdfSigner, type AgreementPdfEvent } from "./AgreementPdf";

export type AgreementPdfKind = "draft" | "participant_signed" | "executed";

/** Loads everything needed to render an agreement's PDF and produces the buffer. Pure — never touches AgreementDocument storage. */
export async function generateAgreementPdfBuffer(agreementId: string, kind: AgreementPdfKind): Promise<Buffer> {
  const agreement = await prisma.agreement.findUniqueOrThrow({
    where: { id: agreementId },
    include: { template: true, signers: true, events: { orderBy: { createdAt: "asc" } } },
  });

  if (!agreement.renderedBody || !agreement.contentSha256) {
    throw new Error("Agreement has not been marked ready yet — nothing to render.");
  }

  const effectiveDate = computeEffectiveDate(agreement.signers);
  const filledMarkdown = fillSystemTokens(agreement.renderedBody, {
    effectiveDate,
    signers: agreement.signers.map((s) => ({
      role: s.role,
      name: s.name,
      title: s.title,
      status: s.status,
      signedAt: s.signedAt,
      typedName: s.typedName,
    })),
  });

  const signerRoles = agreement.template.signerRoles as Array<{ role: string; label: string }>;
  const requiredInitials = agreement.template.requiredInitials as Array<{ section: string; label: string }>;
  const signers: AgreementPdfSigner[] = agreement.signers
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const initials = (s.initials as Record<string, boolean> | null) ?? {};
      const initialedSections = requiredInitials.filter((r) => initials[r.section]).map((r) => r.section);
      return {
        role: s.role,
        label: signerRoles.find((r) => r.role === s.role)?.label ?? s.role,
        name: s.name,
        title: s.title,
        status: s.status,
        signedAt: s.signedAt,
        typedName: s.typedName,
        signatureImage: s.signatureImage,
        consentVersion: s.consentVersion,
        initialedSections,
      };
    });

  const events: AgreementPdfEvent[] = agreement.events.map((e) => ({
    type: e.type,
    actorRole: e.actorRole,
    createdAt: e.createdAt,
    ip: e.ip,
    userAgent: e.userAgent,
  }));

  return renderToBuffer(
    AgreementPdf({
      kind,
      agreementId: agreement.id,
      contentSha256: agreement.contentSha256,
      templateKey: agreement.template.key,
      templateVersion: agreement.template.version,
      title: agreement.template.title,
      filledMarkdown,
      signers,
      events,
    })
  );
}

/** Generates and caches a `participant_signed`/`executed` PDF as a new AgreementDocument version. Drafts are never cached — always rendered live, since they can change up until "ready". */
export async function generateAndStoreAgreementPdf(agreementId: string, kind: "participant_signed" | "executed") {
  const bytes = await generateAgreementPdfBuffer(agreementId, kind);
  const sha256 = sha256Hex(bytes.toString("base64"));

  const lastVersion = await prisma.agreementDocument.findFirst({
    where: { agreementId, kind },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  return prisma.agreementDocument.create({
    data: { agreementId, kind, version: (lastVersion?.version ?? 0) + 1, sha256, bytes },
  });
}

/** Returns the most recently generated cached PDF of a kind, if any. */
export async function getLatestAgreementDocument(agreementId: string, kind: AgreementPdfKind) {
  return prisma.agreementDocument.findFirst({
    where: { agreementId, kind },
    orderBy: { version: "desc" },
  });
}
