import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Append-only audit log. `meta` must never hold codes, tokens, notes,
 * recaps, or financial details — only enough to say what happened.
 */
export async function logPortalEvent(params: {
  actorPersonId?: string | null;
  actorRole: "member" | "coach" | "admin" | "partner" | "system";
  action: string;
  subjectType: string;
  subjectId: string;
  enrollmentId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  meta?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.portalEvent.create({
    data: {
      actorPersonId: params.actorPersonId ?? null,
      actorRole: params.actorRole,
      action: params.action,
      subjectType: params.subjectType,
      subjectId: params.subjectId,
      enrollmentId: params.enrollmentId ?? null,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
      meta: params.meta,
    },
  });
}
