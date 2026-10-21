import { describe, expect, it, vi, beforeEach } from "vitest";
import { getEnrollmentScope, scopeIncludesEnrollment, partnerCanSeeModule } from "../../src/lib/portal/policy";
import { getEnrollmentForActor } from "../../src/lib/portal/data/enrollments";
import { listStepsForActor, setStepStatusForMember, reorderStepsForStaff } from "../../src/lib/portal/data/steps";
import type { PortalActor } from "../../src/lib/portal/auth";

const db = vi.hoisted(() => ({
  portalEnrollment: { findMany: vi.fn(), findUnique: vi.fn() },
  portalPartnerGrant: { findMany: vi.fn() },
  portalActionStep: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  portalEvent: { create: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: db }));

function makeActor(overrides: Partial<PortalActor> = {}): PortalActor {
  return {
    personId: "person-a",
    sessionId: "session-1",
    activeEnrollmentId: null,
    firstName: "A",
    lastName: "Member",
    email: "a@example.com",
    staffRoles: [],
    isCoach: false,
    isAdmin: false,
    partnerOrgIds: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getEnrollmentScope", () => {
  it("admin sees everything, with no enrollmentIds restriction", async () => {
    const actor = makeActor({ isAdmin: true, staffRoles: ["admin"] });
    const scope = await getEnrollmentScope(actor);
    expect(scope.kind).toBe("admin");
    expect(scopeIncludesEnrollment(scope, "anything")).toBe(true);
    expect(db.portalEnrollment.findMany).not.toHaveBeenCalled();
  });

  it("coach is scoped to enrollments where they are coachPersonId", async () => {
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-1" }, { id: "enr-2" }]);
    const actor = makeActor({ isCoach: true, staffRoles: ["coach"], personId: "coach-1" });
    const scope = await getEnrollmentScope(actor);
    expect(db.portalEnrollment.findMany).toHaveBeenCalledWith({
      where: { coachPersonId: "coach-1" },
      select: { id: true },
    });
    expect(scope.enrollmentIds).toEqual(["enr-1", "enr-2"]);
    expect(scopeIncludesEnrollment(scope, "enr-3")).toBe(false);
  });

  it("member is scoped to their own enrollments only", async () => {
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-mine" }]);
    const actor = makeActor({ personId: "member-1" });
    const scope = await getEnrollmentScope(actor);
    expect(db.portalEnrollment.findMany).toHaveBeenCalledWith({
      where: { personId: "member-1" },
      select: { id: true },
    });
    expect(scopeIncludesEnrollment(scope, "enr-mine")).toBe(true);
    expect(scopeIncludesEnrollment(scope, "enr-someone-elses")).toBe(false);
  });

  it("partner is scoped to enrollments with an active grant to their org, and only the granted modules", async () => {
    db.portalPartnerGrant.findMany.mockResolvedValueOnce([
      { enrollmentId: "enr-granted", modules: ["brand_website"] },
    ]);
    const actor = makeActor({ partnerOrgIds: ["org-mmg"] });
    const scope = await getEnrollmentScope(actor);
    expect(scope.kind).toBe("partner");
    expect(scopeIncludesEnrollment(scope, "enr-granted")).toBe(true);
    expect(scopeIncludesEnrollment(scope, "enr-not-granted")).toBe(false);
    expect(partnerCanSeeModule(scope, "enr-granted", "brand_website")).toBe(true);
  });

  it("strips any module outside the partner-grantable allowlist, even if present in the grant JSON (malformed/legacy data)", async () => {
    db.portalPartnerGrant.findMany.mockResolvedValueOnce([
      { enrollmentId: "enr-1", modules: ["brand_website", "payments", "reflections"] },
    ]);
    const actor = makeActor({ partnerOrgIds: ["org-mmg"] });
    const scope = await getEnrollmentScope(actor);
    expect(scope.partnerModulesByEnrollment.get("enr-1")).toEqual(["brand_website"]);
  });
});

describe("data/enrollments isolation", () => {
  it("getEnrollmentForActor returns null (never throws) for an enrollment outside the actor's scope", async () => {
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-mine" }]);
    const actor = makeActor({ personId: "member-1" });
    const result = await getEnrollmentForActor(actor, "someone-elses-enrollment");
    expect(result).toBeNull();
    // Scope check short-circuits before any lookup of the target row.
    expect(db.portalEnrollment.findUnique).not.toHaveBeenCalled();
  });

  it("getEnrollmentForActor returns the row when it's in scope", async () => {
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-mine" }]);
    db.portalEnrollment.findUnique.mockResolvedValueOnce({ id: "enr-mine", coachPersonId: null });
    const actor = makeActor({ personId: "member-1" });
    const result = await getEnrollmentForActor(actor, "enr-mine");
    expect(result).toEqual({ id: "enr-mine", coachPersonId: null });
  });
});

describe("data/steps isolation", () => {
  it("listStepsForActor returns null for an out-of-scope enrollment instead of the step list", async () => {
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-mine" }]);
    const actor = makeActor({ personId: "member-1" });
    const result = await listStepsForActor(actor, "someone-elses-enrollment");
    expect(result).toBeNull();
    expect(db.portalActionStep.findMany).not.toHaveBeenCalled();
  });

  it("setStepStatusForMember refuses to update a step on an enrollment the member doesn't own", async () => {
    db.portalActionStep.findUnique.mockResolvedValueOnce({ id: "step-1", enrollmentId: "not-mine" });
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-mine" }]);
    const actor = makeActor({ personId: "member-1" });
    const result = await setStepStatusForMember(actor, "step-1", { status: "done" });
    expect(result).toBeNull();
    expect(db.portalActionStep.update).not.toHaveBeenCalled();
  });

  it("setStepStatusForMember rejects a note over 500 characters", async () => {
    db.portalActionStep.findUnique.mockResolvedValueOnce({ id: "step-1", enrollmentId: "enr-mine" });
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-mine" }]);
    const actor = makeActor({ personId: "member-1" });
    await expect(
      setStepStatusForMember(actor, "step-1", { status: "open", memberNote: "x".repeat(501) })
    ).rejects.toThrow(/500 characters/);
    expect(db.portalActionStep.update).not.toHaveBeenCalled();
  });
});

describe("reorderStepsForStaff", () => {
  it("refuses a non-staff actor", async () => {
    const actor = makeActor({ personId: "member-1" });
    const result = await reorderStepsForStaff(actor, "enr-1", ["a", "b"]);
    expect(result).toBe(false);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("refuses an enrollment outside a coach's scope", async () => {
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-other" }]);
    const actor = makeActor({ isCoach: true, staffRoles: ["coach"], personId: "coach-1" });
    const result = await reorderStepsForStaff(actor, "enr-1", ["a", "b"]);
    expect(result).toBe(false);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("refuses a partial list that doesn't cover every step on the enrollment", async () => {
    const actor = makeActor({ isAdmin: true, staffRoles: ["admin"] });
    db.portalActionStep.findMany.mockResolvedValueOnce([{ id: "a" }, { id: "b" }, { id: "c" }]);
    const result = await reorderStepsForStaff(actor, "enr-1", ["a", "b"]);
    expect(result).toBe(false);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("refuses a list containing an id from a different enrollment", async () => {
    const actor = makeActor({ isAdmin: true, staffRoles: ["admin"] });
    db.portalActionStep.findMany.mockResolvedValueOnce([{ id: "a" }, { id: "b" }]);
    const result = await reorderStepsForStaff(actor, "enr-1", ["a", "someone-elses-step"]);
    expect(result).toBe(false);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("reorders every step to match the given order in one transaction", async () => {
    const actor = makeActor({ isAdmin: true, staffRoles: ["admin"] });
    db.portalActionStep.findMany.mockResolvedValueOnce([{ id: "a" }, { id: "b" }, { id: "c" }]);
    db.$transaction.mockResolvedValueOnce(undefined);
    const result = await reorderStepsForStaff(actor, "enr-1", ["c", "a", "b"]);
    expect(result).toBe(true);
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(db.portalActionStep.update).toHaveBeenCalledTimes(3);
    expect(db.portalActionStep.update).toHaveBeenNthCalledWith(1, { where: { id: "c" }, data: { order: 0 } });
    expect(db.portalActionStep.update).toHaveBeenNthCalledWith(2, { where: { id: "a" }, data: { order: 1 } });
    expect(db.portalActionStep.update).toHaveBeenNthCalledWith(3, { where: { id: "b" }, data: { order: 2 } });
    expect(db.portalEvent.create).toHaveBeenCalled();
  });
});
