import { describe, expect, it } from "vitest";
import { scoreOpportunity } from "../../src/lib/scoring/engine";
import { classify, RUBRIC_TOTAL } from "../../src/lib/scoring/rubric";
import type { ScoringInput } from "../../src/lib/domain/types";

/** A well-formed, fully-known opportunity. Individual tests degrade it. */
function baseInput(overrides: Partial<ScoringInput> = {}): ScoringInput {
  return {
    title: "Young Adults Pastor",
    lane: "young_adults_pastor",
    laneConfidence: 1,
    bodyText:
      "Develop and implement the discipleship pathway for young adults. Build a team of volunteer leaders, develop leaders, teach regularly, provide pastoral care, own the budget. Reports to the lead pastor and sits on the lead team. Spiritual formation is central. Small groups multiplication is expected.",
    responsibilities: [
      "Develop and implement the discipleship pathway",
      "Develop leaders and build a team",
      "Teach regularly",
      "Provide pastoral care",
      "Supervise the young adults team",
    ],
    qualifications: ["Bachelor's degree"],
    church: { name: "Test Church", denomination: "Non-denominational", network: null, onHold: false, researched: true },
    theology: {
      approvedTopics: ["scripture", "salvation", "gospel"],
      churchSignals: ["statement of faith affirms the authority of scripture and the trinity"],
      statementOfFaithFound: true,
    },
    cultureClaims: [
      { category: "culture", claim: "Publishes elder board and values leadership development.", kind: "VERIFIED_FACT" },
      { category: "ministry_philosophy", claim: "Stated values name discipleship and accountability.", kind: "VERIFIED_FACT" },
      { category: "culture", claim: "Staff page describes team care rhythms.", kind: "VERIFIED_FACT" },
    ],
    compensation: {
      salaryMin: 70000,
      salaryMax: 85000,
      benefits: ["health insurance", "retirement", "PTO"],
      housingNote: null,
      relocationNote: "Relocation assistance provided",
    },
    location: { city: "Franklin", state: "TN" },
    candidate: { approvedCredentials: [], approvedEducation: ["Bachelor of Arts Ministry"], relocationOpen: true },
    preferences: { minSalary: 60000, preferredSalary: 75000, nationwide: true, states: [] },
    ...overrides,
  };
}

describe("scoring engine", () => {
  it("never exceeds the rubric total and never goes negative", () => {
    const high = scoreOpportunity(baseInput());
    expect(high.score).toBeLessThanOrEqual(RUBRIC_TOTAL);
    expect(high.score).toBeGreaterThanOrEqual(0);
  });

  it("scores a well-aligned, fully-researched role into PRIORITY", () => {
    const result = scoreOpportunity(baseInput());
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.classification).toBe("PRIORITY");
  });

  it("caps theological alignment when the candidate theology database is empty", () => {
    const known = scoreOpportunity(baseInput());
    const unknown = scoreOpportunity(
      baseInput({
        theology: { approvedTopics: [], churchSignals: [], statementOfFaithFound: false },
      }),
    );

    const dim = (r: typeof known, key: string) => r.dimensions.find((d) => d.key === key)!;
    expect(dim(unknown, "theological_alignment").awarded).toBeLessThan(
      dim(known, "theological_alignment").awarded,
    );
    // Both sides unknown: hard ceiling of 40% of 20 points.
    expect(dim(unknown, "theological_alignment").awarded).toBeLessThanOrEqual(8);
    expect(dim(unknown, "theological_alignment").confidence).toBe("UNKNOWN");
  });

  it("does not award full theology marks on silence", () => {
    const result = scoreOpportunity(
      baseInput({ theology: { approvedTopics: [], churchSignals: [], statementOfFaithFound: false } }),
    );
    const dim = result.dimensions.find((d) => d.key === "theological_alignment")!;
    expect(dim.awarded).toBeLessThan(dim.max);
    expect(result.unknowns.join(" ")).toMatch(/theolog/i);
  });

  it("marks compensation UNKNOWN rather than zero when undisclosed", () => {
    const result = scoreOpportunity(
      baseInput({
        compensation: { salaryMin: null, salaryMax: null, benefits: [], housingNote: null, relocationNote: null },
      }),
    );
    const dim = result.dimensions.find((d) => d.key === "compensation")!;
    expect(dim.confidence).toBe("UNKNOWN");
    expect(dim.awarded).toBeGreaterThan(0);
    expect(dim.awarded).toBeLessThan(dim.max);
    expect(result.unknowns.join(" ")).toMatch(/compensation not disclosed/i);
  });

  it("does not heavily penalize geography, since the candidate relocates", () => {
    const tn = scoreOpportunity(baseInput());
    const ak = scoreOpportunity(baseInput({ location: { city: "Nome", state: "AK" } }));
    expect(Math.abs(tn.score - ak.score)).toBeLessThanOrEqual(2);
  });

  it("penalizes an event-managing role wearing a pastoral title", () => {
    const formation = scoreOpportunity(baseInput());
    const events = scoreOpportunity(
      baseInput({
        bodyText: "Event planning and event coordination for young adults. Calendar management and logistics.",
        responsibilities: ["Event planning", "Calendar management"],
      }),
    );
    const dimOf = (r: typeof formation) => r.dimensions.find((d) => d.key === "ministry_alignment")!.awarded;
    expect(dimOf(events)).toBeLessThan(dimOf(formation));
  });

  it("classifies by band boundaries exactly", () => {
    expect(classify(100)).toBe("PRIORITY");
    expect(classify(90)).toBe("PRIORITY");
    expect(classify(89)).toBe("STRONG");
    expect(classify(80)).toBe("STRONG");
    expect(classify(79)).toBe("REVIEW");
    expect(classify(70)).toBe("REVIEW");
    expect(classify(69)).toBe("PASS");
    expect(classify(0)).toBe("PASS");
  });

  it("records unknowns rather than silently guessing", () => {
    const result = scoreOpportunity(
      baseInput({
        church: { name: "Unknown Church", denomination: null, network: null, onHold: false, researched: false },
        theology: { approvedTopics: [], churchSignals: [], statementOfFaithFound: false },
        cultureClaims: [],
        compensation: { salaryMin: null, salaryMax: null, benefits: [], housingNote: null, relocationNote: null },
      }),
    );
    expect(result.unknowns.length).toBeGreaterThanOrEqual(3);
  });
});

describe("red flag overrides", () => {
  it("forces PASS when the church is on the HOLD list, regardless of score", () => {
    const result = scoreOpportunity(
      baseInput({
        church: { name: "Rock Harbor Church", denomination: null, network: null, onHold: true, researched: true },
      }),
    );
    expect(result.rawClassification).toBe("PRIORITY");
    expect(result.classification).toBe("PASS");
    expect(result.redFlags.some((f) => f.code === "CHURCH_ON_HOLD")).toBe(true);
  });

  it("flags an unapproved doctrinal affirmation", () => {
    const result = scoreOpportunity(
      baseInput({
        bodyText: `${baseInput().bodyText} Candidate must affirm our complementarian position on gender roles.`,
      }),
    );
    const flag = result.redFlags.find((f) => f.code === "UNAPPROVED_DOCTRINAL_AFFIRMATION");
    expect(flag).toBeDefined();
    expect(flag!.message).toMatch(/NOT YET DEFINED/);
  });

  it("does not flag an affirmation the candidate has an approved position on", () => {
    const result = scoreOpportunity(
      baseInput({
        bodyText: `${baseInput().bodyText} Candidate must affirm our complementarianism position.`,
        theology: {
          approvedTopics: ["complementarianism"],
          churchSignals: ["authority of scripture"],
          statementOfFaithFound: true,
        },
      }),
    );
    expect(result.redFlags.some((f) => f.code === "UNAPPROVED_DOCTRINAL_AFFIRMATION")).toBe(false);
  });

  it("flags compensation materially below the approved floor and can force PASS", () => {
    const result = scoreOpportunity(
      baseInput({
        compensation: { salaryMin: 30000, salaryMax: 34000, benefits: [], housingNote: null, relocationNote: null },
        preferences: { minSalary: 70000, preferredSalary: 80000, nationwide: true, states: [] },
      }),
    );
    const flag = result.redFlags.find((f) => f.code === "COMPENSATION_BELOW_FLOOR");
    expect(flag).toBeDefined();
    expect(flag!.severity).toBe("CRITICAL");
    expect(result.classification).toBe("PASS");
  });

  it("flags a pastoral title over an administrative job", () => {
    const result = scoreOpportunity(
      baseInput({
        title: "Discipleship Pastor",
        bodyText: "Office management, calendar management, data entry, scheduling meetings, administrative support.",
        responsibilities: ["Office management", "Data entry"],
      }),
    );
    expect(result.redFlags.some((f) => f.code === "PASTORAL_TITLE_ADMIN_ROLE")).toBe(true);
  });

  it("every red flag carries evidence", () => {
    const result = scoreOpportunity(
      baseInput({
        church: { name: "Rock Harbor Church", denomination: null, network: null, onHold: true, researched: true },
        bodyText: "Must be ordained and hold an MDiv. Must affirm our complementarian position. Office management and data entry.",
      }),
    );
    expect(result.redFlags.length).toBeGreaterThan(0);
    for (const f of result.redFlags) {
      expect(f.evidence.trim().length).toBeGreaterThan(0);
    }
  });

  it("does not invent character or misconduct findings", () => {
    const result = scoreOpportunity(baseInput());
    const text = result.redFlags.map((f) => f.message).join(" ").toLowerCase();
    expect(text).not.toMatch(/abuse|toxic|scandal|misconduct/);
  });
});
