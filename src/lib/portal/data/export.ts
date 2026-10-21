import archiver from "archiver";
import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { logPortalEvent } from "./events";

/**
 * "Download my data" — always the actor's own records as a member, scoped
 * strictly by personId, regardless of any staff/partner role they also
 * hold. Never routes through getEnrollmentScope, which exists to broaden
 * access for staff — this export must never be broadened.
 *
 * Private notes are never queried here, by construction, so they can never
 * appear in the export.
 */
export async function buildMemberDataExportZip(actor: PortalActor): Promise<Buffer> {
  const enrollments = await prisma.portalEnrollment.findMany({ where: { personId: actor.personId } });
  const enrollmentIds = enrollments.map((e) => e.id);

  const [phases, meetings, steps, installments, events, documents] = await Promise.all([
    prisma.portalPhase.findMany({ where: { enrollmentId: { in: enrollmentIds } } }),
    prisma.portalMeeting.findMany({
      where: { enrollmentId: { in: enrollmentIds } },
      select: {
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
      },
    }),
    prisma.portalActionStep.findMany({ where: { enrollmentId: { in: enrollmentIds } } }),
    prisma.portalInstallment.findMany({ where: { enrollmentId: { in: enrollmentIds } } }),
    prisma.portalEvent.findMany({
      where: { OR: [{ enrollmentId: { in: enrollmentIds } }, { actorPersonId: actor.personId }] },
      orderBy: { at: "asc" },
    }),
    prisma.portalDocument.findMany({ where: { enrollmentId: { in: enrollmentIds }, visibleToMember: true } }),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    person: { firstName: actor.firstName, lastName: actor.lastName, email: actor.email },
    enrollments,
    phases,
    sessions: meetings, // "sessions" is the member-facing name for portal_meetings
    steps,
    installments,
    events,
    documents: documents.map((d) => ({ id: d.id, title: d.title, kind: d.kind, filename: d.filename })),
  };

  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  archive.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<void>((resolve, reject) => {
    archive.on("end", resolve);
    archive.on("error", reject);
  });

  archive.append(JSON.stringify(data, null, 2), { name: "data.json" });

  for (const doc of documents) {
    let bytes: Buffer | undefined;
    if (doc.agreementDocumentId) {
      const agreementDoc = await prisma.agreementDocument.findUnique({ where: { id: doc.agreementDocumentId } });
      bytes = agreementDoc?.bytes;
    } else {
      const blob = await prisma.portalDocumentBlob.findUnique({ where: { documentId: doc.id } });
      bytes = blob?.bytes;
    }
    if (bytes) archive.append(bytes, { name: `documents/${doc.filename}` });
  }

  await archive.finalize();
  await finished;

  await logPortalEvent({
    actorPersonId: actor.personId,
    actorRole: "member",
    action: "data_exported",
    subjectType: "portal_person",
    subjectId: actor.personId,
  });

  return Buffer.concat(chunks);
}
