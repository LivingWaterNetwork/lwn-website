import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { scopeIncludesEnrollment, getEnrollmentScope, partnerCanSeeModule } from "../policy";
import { logPortalEvent } from "./events";

/** The program library (enrollmentId = null) is visible to any signed-in member/coach/admin, never to a partner. */
export async function listDocumentsForActor(actor: PortalActor, enrollmentId: string | null) {
  const scope = await getEnrollmentScope(actor);

  if (enrollmentId === null) {
    if (scope.kind === "partner") return [];
    return prisma.portalDocument.findMany({
      where: { enrollmentId: null, visibleToMember: true },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!scopeIncludesEnrollment(scope, enrollmentId)) return null;

  if (scope.kind === "partner") {
    if (!partnerCanSeeModule(scope, enrollmentId, "brand_website")) return [];
    return prisma.portalDocument.findMany({
      where: { enrollmentId, kind: "brand_website" },
      orderBy: { createdAt: "desc" },
    });
  }

  if (scope.kind === "member") {
    return prisma.portalDocument.findMany({
      where: { enrollmentId, visibleToMember: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // coach / admin — everything, including items not yet toggled visible to the member.
  return prisma.portalDocument.findMany({ where: { enrollmentId }, orderBy: { createdAt: "desc" } });
}

export interface DocumentDownload {
  filename: string;
  mime: string;
  bytes: Buffer;
}

/**
 * Resolves a document's bytes for `actor`, applying the same visibility
 * rules as listDocumentsForActor, and logs the download. Returns null for
 * anything out of scope — callers return a flat 404.
 */
export async function getDocumentDownloadForActor(actor: PortalActor, documentId: string): Promise<DocumentDownload | null> {
  const document = await prisma.portalDocument.findUnique({ where: { id: documentId } });
  if (!document) return null;

  const scope = await getEnrollmentScope(actor);

  if (document.enrollmentId === null) {
    if (scope.kind === "partner" || !document.visibleToMember) return null;
  } else {
    if (!scopeIncludesEnrollment(scope, document.enrollmentId)) return null;
    if (scope.kind === "partner") {
      if (document.kind !== "brand_website" || !partnerCanSeeModule(scope, document.enrollmentId, "brand_website")) {
        return null;
      }
    } else if (scope.kind === "member" && !document.visibleToMember) {
      return null;
    }
  }

  let bytes: Buffer;
  if (document.agreementDocumentId) {
    const agreementDoc = await prisma.agreementDocument.findUnique({ where: { id: document.agreementDocumentId } });
    if (!agreementDoc) return null;
    bytes = agreementDoc.bytes;
  } else {
    const blob = await prisma.portalDocumentBlob.findUnique({ where: { documentId: document.id } });
    if (!blob) return null;
    bytes = blob.bytes;
  }

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: scope.kind === "admin" ? "admin" : scope.kind === "coach" ? "coach" : scope.kind === "partner" ? "partner" : "member",
    action: "document_downloaded",
    subjectType: "portal_document",
    subjectId: document.id,
    enrollmentId: document.enrollmentId,
  });

  return { filename: document.filename, mime: document.mime, bytes };
}
