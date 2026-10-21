import { prisma } from "@/lib/prisma";
import type { PortalActor } from "./auth";
import { isPartner, isStaff } from "./auth";
import { isPartnerGrantableModule, type PartnerGrantableModule } from "./constants";

/**
 * The only thing every `lib/portal/data/*` function needs: which
 * enrollment ids this actor may read or write at all, and — for a
 * partner — which modules they're allowed to see per enrollment. Built
 * fresh from the DB on every call (no caching across requests), since a
 * grant can be revoked mid-session and the next read must reflect that
 * immediately.
 *
 * A route or page should never query `portal_*` models directly — only
 * through `lib/portal/data/*`, which always calls this first and folds the
 * result into its own Prisma `where`. Enforced by
 * tests/unit/portalNoDirectQueries.test.ts.
 */
export interface EnrollmentScope {
  kind: "member" | "coach" | "admin" | "partner" | "none";
  /** Enrollment ids this actor may access. Only meaningful for "member" | "coach" | "partner" — admin and none ignore it. */
  enrollmentIds: string[];
  /** Per-enrollment allowed modules, partner only. Empty/absent means "not a partner view". */
  partnerModulesByEnrollment: Map<string, PartnerGrantableModule[]>;
}

export async function getEnrollmentScope(actor: PortalActor): Promise<EnrollmentScope> {
  if (actor.isAdmin) {
    return { kind: "admin", enrollmentIds: [], partnerModulesByEnrollment: new Map() };
  }

  if (actor.isCoach) {
    const rows = await prisma.portalEnrollment.findMany({
      where: { coachPersonId: actor.personId },
      select: { id: true },
    });
    return { kind: "coach", enrollmentIds: rows.map((r) => r.id), partnerModulesByEnrollment: new Map() };
  }

  if (isPartner(actor)) {
    const grants = await prisma.portalPartnerGrant.findMany({
      where: { partnerOrgId: { in: actor.partnerOrgIds }, revokedAt: null },
      select: { enrollmentId: true, modules: true },
    });
    const partnerModulesByEnrollment = new Map<string, PartnerGrantableModule[]>();
    for (const grant of grants) {
      const modules = Array.isArray(grant.modules)
        ? (grant.modules as unknown[])
            .filter((m): m is string => typeof m === "string")
            .filter(isPartnerGrantableModule)
        : [];
      partnerModulesByEnrollment.set(grant.enrollmentId, modules);
    }
    return {
      kind: "partner",
      enrollmentIds: Array.from(partnerModulesByEnrollment.keys()),
      partnerModulesByEnrollment,
    };
  }

  // Plain member: own enrollments only.
  const rows = await prisma.portalEnrollment.findMany({
    where: { personId: actor.personId },
    select: { id: true },
  });
  return { kind: "member", enrollmentIds: rows.map((r) => r.id), partnerModulesByEnrollment: new Map() };
}

/** Whether `scope` grants any access at all to `enrollmentId`. */
export function scopeIncludesEnrollment(scope: EnrollmentScope, enrollmentId: string): boolean {
  if (scope.kind === "admin") return true;
  return scope.enrollmentIds.includes(enrollmentId);
}

/** A partner's view is gated both by enrollment and by module — brand_website-tagged items only in Phase 1, never reflections/stewardship/payments/recaps/notes. */
export function partnerCanSeeModule(
  scope: EnrollmentScope,
  enrollmentId: string,
  module: PartnerGrantableModule
): boolean {
  if (scope.kind !== "partner") return false;
  const modules = scope.partnerModulesByEnrollment.get(enrollmentId);
  return Boolean(modules?.includes(module));
}

/** Staff (coach or admin) may write private notes and payments; partners and members never can. */
export function canWritePrivateNotes(actor: PortalActor): boolean {
  return isStaff(actor);
}
