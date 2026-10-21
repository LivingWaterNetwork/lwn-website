import { describe, expect, it, vi, beforeEach } from "vitest";
import { searchAgreementsForLinking, getLinkedAgreementSummaryForStaff } from "../../src/lib/portal/data/agreementLinking";
import type { PortalActor } from "../../src/lib/portal/auth";

const db = vi.hoisted(() => ({
  portalEnrollment: { findMany: vi.fn() },
  agreementSigner: { findMany: vi.fn() },
  agreement: { findUnique: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: db }));

function makeActor(overrides: Partial<PortalActor> = {}): PortalActor {
  return {
    personId: "coach-1",
    sessionId: "session-1",
    activeEnrollmentId: null,
    firstName: "Coach",
    lastName: "One",
    email: "coach@example.com",
    staffRoles: ["coach"],
    isCoach: true,
    isAdmin: false,
    partnerOrgIds: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("searchAgreementsForLinking", () => {
  it("refuses a non-staff actor", async () => {
    const actor = makeActor({ isCoach: false, staffRoles: [] });
    const result = await searchAgreementsForLinking(actor, "enr-1", "a@example.com");
    expect(result).toBeNull();
  });

  it("refuses an enrollment outside a coach's scope", async () => {
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-other" }]);
    const actor = makeActor();
    const result = await searchAgreementsForLinking(actor, "enr-1", "a@example.com");
    expect(result).toBeNull();
    expect(db.agreementSigner.findMany).not.toHaveBeenCalled();
  });

  it("filters out voided agreements and normalizes the search email", async () => {
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-1" }]);
    db.agreementSigner.findMany.mockResolvedValueOnce([
      {
        name: "Amaya Frias",
        email: "amayaf1315@gmail.com",
        agreement: { id: "agr-executed", slug: "amaya-abc123", status: "executed", template: { title: "60-Day Coaching" } },
      },
      {
        name: "Amaya Frias",
        email: "amayaf1315@gmail.com",
        agreement: { id: "agr-voided", slug: "amaya-old", status: "voided", template: { title: "60-Day Coaching" } },
      },
    ]);
    const actor = makeActor();
    const result = await searchAgreementsForLinking(actor, "enr-1", "  AmayaF1315@Gmail.com  ");
    expect(db.agreementSigner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { role: "participant", email: "amayaf1315@gmail.com" } })
    );
    expect(result).toHaveLength(1);
    expect(result?.[0].id).toBe("agr-executed");
  });

  it("returns an empty list for a blank email without querying", async () => {
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-1" }]);
    const actor = makeActor();
    const result = await searchAgreementsForLinking(actor, "enr-1", "   ");
    expect(result).toEqual([]);
    expect(db.agreementSigner.findMany).not.toHaveBeenCalled();
  });
});

describe("getLinkedAgreementSummaryForStaff", () => {
  it("returns null when the agreement no longer exists", async () => {
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-1" }]);
    db.agreement.findUnique.mockResolvedValueOnce(null);
    const actor = makeActor();
    const result = await getLinkedAgreementSummaryForStaff(actor, "enr-1", "agr-gone");
    expect(result).toBeNull();
  });

  it("returns the participant summary when found", async () => {
    db.portalEnrollment.findMany.mockResolvedValueOnce([{ id: "enr-1" }]);
    db.agreement.findUnique.mockResolvedValueOnce({
      id: "agr-1",
      slug: "amaya-abc123",
      status: "executed",
      template: { title: "60-Day Coaching" },
      signers: [{ name: "Amaya Frias", email: "amayaf1315@gmail.com" }],
    });
    const actor = makeActor();
    const result = await getLinkedAgreementSummaryForStaff(actor, "enr-1", "agr-1");
    expect(result).toEqual({
      id: "agr-1",
      slug: "amaya-abc123",
      status: "executed",
      templateTitle: "60-Day Coaching",
      participantName: "Amaya Frias",
      participantEmail: "amayaf1315@gmail.com",
    });
  });
});
