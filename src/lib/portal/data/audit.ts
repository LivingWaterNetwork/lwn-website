import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";

export interface AuditFilter {
  enrollmentId?: string;
  actorPersonId?: string;
  action?: string;
}

/** Admin-only, full audit log with filters. */
export async function listAuditEventsForAdmin(actor: PortalActor, filter: AuditFilter = {}, limit = 200) {
  if (!actor.isAdmin) return null;

  return prisma.portalEvent.findMany({
    where: {
      enrollmentId: filter.enrollmentId,
      actorPersonId: filter.actorPersonId,
      action: filter.action,
    },
    orderBy: { at: "desc" },
    take: limit,
  });
}
