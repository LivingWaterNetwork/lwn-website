import { describe, expect, it } from "vitest";
import {
  authorizeSubmission,
  readinessForApproval,
  type PackageForApproval,
} from "../../src/lib/application/approval-gate";

function pkg(overrides: Partial<PackageForApproval> = {}): PackageForApproval {
  return {
    id: "pkg1",
    status: "READY_FOR_APPROVAL",
    resumeVariant: "young-adults",
    coverLetterDraft: "x".repeat(400),
    questions: [
      { id: "q1", questionText: "Describe your calling.", required: true, resolution: "RESOLVED", answerText: "…" },
    ],
    attestations: [],
    openHumanInputs: [],
    approvals: [],
    opportunity: {
      id: "opp1",
      title: "Young Adults Pastor",
      churchName: "Test Church",
      onHold: false,
      classification: "PRIORITY",
      score: 92,
    },
    ...overrides,
  };
}

describe("submission authorization", () => {
  it("blocks submission with no approval record", () => {
    const r = authorizeSubmission(pkg());
    expect(r.canSubmit).toBe(false);
    expect(r.blockers.join(" ")).toMatch(/APPROVE APPLICATION has not been given/);
  });

  it("permits submission only after an explicit APPROVED decision", () => {
    const r = authorizeSubmission(
      pkg({ approvals: [{ decision: "APPROVED", decidedAt: new Date(), decidedBy: "candidate" }] }),
    );
    expect(r.canSubmit).toBe(true);
    expect(r.blockers).toHaveLength(0);
  });

  it("treats a later rejection as superseding an earlier approval", () => {
    const r = authorizeSubmission(
      pkg({
        approvals: [
          { decision: "APPROVED", decidedAt: new Date("2026-01-01"), decidedBy: "candidate" },
          { decision: "CHANGES_REQUESTED", decidedAt: new Date("2026-02-01"), decidedBy: "candidate" },
        ],
      }),
    );
    expect(r.canSubmit).toBe(false);
    expect(r.blockers.join(" ")).toMatch(/CHANGES_REQUESTED/);
  });

  it("blocks an already-submitted package from double submission", () => {
    const r = authorizeSubmission(
      pkg({ status: "SUBMITTED", approvals: [{ decision: "APPROVED", decidedAt: new Date(), decidedBy: "candidate" }] }),
    );
    expect(r.canSubmit).toBe(false);
    expect(r.blockers.join(" ")).toMatch(/already been submitted/);
  });

  it("blocks submission to a church on the HOLD list even with an approval", () => {
    const r = authorizeSubmission(
      pkg({
        opportunity: { ...pkg().opportunity, onHold: true, churchName: "Rock Harbor Church" },
        approvals: [{ decision: "APPROVED", decidedAt: new Date(), decidedBy: "candidate" }],
      }),
    );
    expect(r.canSubmit).toBe(false);
    expect(r.blockers.join(" ")).toMatch(/HOLD — DO NOT APPLY/);
  });

  it("blocks while any required question is unresolved, approval or not", () => {
    const r = authorizeSubmission(
      pkg({
        approvals: [{ decision: "APPROVED", decidedAt: new Date(), decidedBy: "candidate" }],
        questions: [
          { id: "q1", questionText: "What is your position on baptism?", required: true, resolution: "THEOLOGICAL_REVIEW_REQUIRED", answerText: null },
        ],
      }),
    );
    expect(r.canSubmit).toBe(false);
    expect(r.blockers.join(" ")).toMatch(/THEOLOGICAL REVIEW REQUIRED/);
  });

  it("blocks on an unresolved attestation", () => {
    const r = authorizeSubmission(
      pkg({
        approvals: [{ decision: "APPROVED", decidedAt: new Date(), decidedBy: "candidate" }],
        questions: [
          { id: "q1", questionText: "I certify the above is accurate.", required: true, resolution: "ATTESTATION_REVIEW_REQUIRED", answerText: null },
        ],
      }),
    );
    expect(r.canSubmit).toBe(false);
    expect(r.blockers.join(" ")).toMatch(/ATTESTATION REVIEW REQUIRED/);
  });

  it("blocks when no resume variant has been selected", () => {
    const r = authorizeSubmission(
      pkg({ resumeVariant: null, approvals: [{ decision: "APPROVED", decidedAt: new Date(), decidedBy: "candidate" }] }),
    );
    expect(r.canSubmit).toBe(false);
    expect(r.blockers.join(" ")).toMatch(/No resume variant/);
  });
});

describe("readiness for the approval screen", () => {
  it("is ready when everything resolves", () => {
    expect(readinessForApproval(pkg()).canSubmit).toBe(true);
  });

  it("warns rather than blocks on an unanswered optional question", () => {
    const r = readinessForApproval(
      pkg({
        questions: [
          { id: "q1", questionText: "Anything else?", required: false, resolution: "HUMAN_INPUT_REQUIRED", answerText: null },
        ],
      }),
    );
    expect(r.canSubmit).toBe(true);
    expect(r.warnings.join(" ")).toMatch(/Optional question/);
  });

  it("surfaces every statement being affirmed as a warning to read", () => {
    const r = readinessForApproval(pkg({ attestations: ["We affirm the Nicene Creed."] }));
    expect(r.warnings.join(" ")).toMatch(/Nicene Creed/);
  });

  it("blocks while anything sits in the human-input queue for this package", () => {
    const r = readinessForApproval(
      pkg({ openHumanInputs: ["Cover letter needs: approved ministry history"] }),
    );
    expect(r.canSubmit).toBe(false);
    expect(r.blockers.join(" ")).toMatch(/HUMAN INPUT REQUIRED/);
  });

  it("blocks on an unfilled [NEEDS:] marker in the cover letter", () => {
    const r = readinessForApproval(
      pkg({ coverLetterDraft: `Dear team, [NEEDS: approved full name] ${"x".repeat(300)}` }),
    );
    expect(r.canSubmit).toBe(false);
    expect(r.blockers.join(" ")).toMatch(/Cover letter is unfinished/);
  });

  it("blocks submission on a queue item even with a live approval", () => {
    const r = authorizeSubmission(
      pkg({
        openHumanInputs: ["What was your average weekly attendance?"],
        approvals: [{ decision: "APPROVED", decidedAt: new Date(), decidedBy: "candidate" }],
      }),
    );
    expect(r.canSubmit).toBe(false);
  });

  it("warns on a thin cover letter without blocking", () => {
    const r = readinessForApproval(pkg({ coverLetterDraft: "Too short." }));
    expect(r.canSubmit).toBe(true);
    expect(r.warnings.join(" ")).toMatch(/Cover letter/);
  });
});
