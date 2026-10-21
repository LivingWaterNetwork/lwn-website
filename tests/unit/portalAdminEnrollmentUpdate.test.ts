import { describe, expect, it, vi, beforeEach } from "vitest";
import { updateEnrollmentForStaff } from "../../src/lib/portal/data/admin";
import type { PortalActor } from "../../src/lib/portal/auth";

const db = vi.hoisted(() => ({
  portalEnrollment: { findMany: vi.fn(), update: vi.fn() },
  agreement: { findUnique: vi.fn() },
  portalEvent: { create: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: db }));

function makeActor(overrides: Partial<PortalActor> = {}): PortalActor {
  return {
    personId: "admin-1",
    sessionId: "session-1",
    activeEnrollmentId: null,
    firstName: "Admin",
    lastName: "One",
    email: "admin@example.com",
    staffRoles: ["admin"],
    isCoach: false,
    isAdmin: true,
    partnerOrgIds: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateEnrollmentForStaff agreement linking", () => {
  it("throws when the agreement id doesn't exist", async () => {
    db.agreement.findUnique.mockResolvedValueOnce(null);
    const actor = makeActor();
    await expect(updateEnrollmentForStaff(actor, "enr-1", { agreementId: "agr-gone" })).rejects.toThrow(
      /no longer exists/
    );
    expect(db.portalEnrollment.update).not.toHaveBeenCalled();
  });

  it("throws when the agreement is voided", async () => {
    db.agreement.findUnique.mockResolvedValueOnce({ id: "agr-1", status: "voided" });
    const actor = makeActor();
    await expect(updateEnrollmentForStaff(actor, "enr-1", { agreementId: "agr-1" })).rejects.toThrow(/voided/);
    expect(db.portalEnrollment.update).not.toHaveBeenCalled();
  });

  it("links a valid, non-voided agreement", async () => {
    db.agreement.findUnique.mockResolvedValueOnce({ id: "agr-1", status: "executed" });
    db.portalEnrollment.update.mockResolvedValueOnce({ id: "enr-1", agreementId: "agr-1" });
    const actor = makeActor();
    const result = await updateEnrollmentForStaff(actor, "enr-1", { agreementId: "agr-1" });
    expect(result).toEqual({ id: "enr-1", agreementId: "agr-1" });
  });

  it("unlinking (agreementId: null) never checks the agreement table", async () => {
    db.portalEnrollment.update.mockResolvedValueOnce({ id: "enr-1", agreementId: null });
    const actor = makeActor();
    const result = await updateEnrollmentForStaff(actor, "enr-1", { agreementId: null });
    expect(result).toEqual({ id: "enr-1", agreementId: null });
    expect(db.agreement.findUnique).not.toHaveBeenCalled();
  });
});
