import { describe, expect, it } from "vitest";
import { resolveQuestion, type ResolverContext } from "../../src/lib/answers/resolver";
import { MATCH_THRESHOLD, similarity, normalizeQuestion } from "../../src/lib/answers/normalize";
import { detectTheologyTopics } from "../../src/lib/theology/topics";

const approvedAnswer = {
  id: "ab1",
  category: "discipleship_philosophy",
  question: "Describe your philosophy of discipleship.",
  approvedAnswer: "Formation leads to discipleship, discipleship builds community, community develops leaders.",
  shortVersion: "Formation, discipleship, community, leaders.",
  mediumVersion: null,
  longVersion: null,
  keywords: ["discipleship"],
  status: "APPROVED",
  allowAutomaticUse: true,
};

const draftAnswer = { ...approvedAnswer, id: "ab2", question: "What are your salary expectations?", status: "DRAFT", category: "salary_expectations" };

function ctx(overrides: Partial<ResolverContext> = {}): ResolverContext {
  return { answerBank: [approvedAnswer], theology: [], facts: [], ...overrides };
}

describe("unknown-answer blocking", () => {
  it("blocks a question with no approved answer", () => {
    const r = resolveQuestion({ questionText: "How many baptisms did you oversee last year?" }, ctx());
    expect(r.resolution).toBe("HUMAN_INPUT_REQUIRED");
    expect(r.answerText).toBeNull();
    expect(r.autoUsable).toBe(false);
    expect(r.note).toMatch(/HUMAN INPUT REQUIRED/);
  });

  it("never invents a number when asked for ministry metrics", () => {
    for (const q of [
      "How many volunteers did you lead?",
      "What was your average weekly attendance?",
      "How large was the budget you managed?",
      "How many staff reported to you?",
    ]) {
      const r = resolveQuestion({ questionText: q }, ctx());
      expect(r.resolution).toBe("HUMAN_INPUT_REQUIRED");
      expect(r.answerText).toBeNull();
    }
  });

  it("refuses to use a DRAFT answer even on an exact question match", () => {
    const r = resolveQuestion(
      { questionText: "What are your salary expectations?" },
      ctx({ answerBank: [draftAnswer] }),
    );
    expect(r.resolution).toBe("HUMAN_INPUT_REQUIRED");
    expect(r.answerText).toBeNull();
  });

  it("uses an approved answer on a close match", () => {
    const r = resolveQuestion({ questionText: "Describe your discipleship philosophy." }, ctx());
    expect(r.resolution).toBe("RESOLVED");
    expect(r.answerSource).toBe("ANSWER_BANK");
    expect(r.answerBankId).toBe("ab1");
  });

  it("honors the length hint", () => {
    const r = resolveQuestion(
      { questionText: "Describe your discipleship philosophy.", lengthHint: "short" },
      ctx(),
    );
    expect(r.answerText).toBe(approvedAnswer.shortVersion);
  });

  it("does not match a merely adjacent question", () => {
    const r = resolveQuestion({ questionText: "Describe your philosophy of church governance." }, ctx());
    expect(r.resolution).not.toBe("RESOLVED");
    expect(r.matchScore ?? 0).toBeLessThan(MATCH_THRESHOLD);
  });

  it("marks an approved answer non-auto-usable when the candidate said so", () => {
    const r = resolveQuestion(
      { questionText: "Describe your philosophy of discipleship." },
      ctx({ answerBank: [{ ...approvedAnswer, allowAutomaticUse: false }] }),
    );
    expect(r.resolution).toBe("RESOLVED");
    expect(r.autoUsable).toBe(false);
  });
});

describe("theological review gate", () => {
  it("routes an undefined doctrinal question to THEOLOGICAL REVIEW REQUIRED", () => {
    const r = resolveQuestion({ questionText: "What is your position on baptism?" }, ctx());
    expect(r.resolution).toBe("THEOLOGICAL_REVIEW_REQUIRED");
    expect(r.answerText).toBeNull();
    expect(r.theologyTopics).toContain("baptism");
  });

  it("refuses even when a related answer-bank entry exists", () => {
    const related = {
      ...approvedAnswer,
      id: "ab3",
      category: "ministry_philosophy",
      question: "What do you believe about spiritual gifts in ministry practice?",
    };
    const r = resolveQuestion(
      { questionText: "What do you believe about spiritual gifts?" },
      ctx({ answerBank: [related] }),
    );
    expect(r.resolution).toBe("THEOLOGICAL_REVIEW_REQUIRED");
    expect(r.answerText).toBeNull();
  });

  it("answers only from an APPROVED theology position", () => {
    const r = resolveQuestion(
      { questionText: "What is your position on baptism?" },
      ctx({
        theology: [
          {
            topic: "baptism",
            displayName: "Baptism",
            status: "APPROVED",
            position: "Approved position text supplied by the candidate.",
            shortForm: "Short form.",
            allowAutomaticUse: true,
          },
        ],
      }),
    );
    expect(r.resolution).toBe("RESOLVED");
    expect(r.answerSource).toBe("THEOLOGY");
    expect(r.answerText).toBe("Approved position text supplied by the candidate.");
  });

  it("still blocks when a position exists but is NOT_YET_DEFINED", () => {
    const r = resolveQuestion(
      { questionText: "What is your position on baptism?" },
      ctx({
        theology: [
          { topic: "baptism", displayName: "Baptism", status: "NOT_YET_DEFINED", position: null, shortForm: null, allowAutomaticUse: false },
        ],
      }),
    );
    expect(r.resolution).toBe("THEOLOGICAL_REVIEW_REQUIRED");
  });

  it("treats a ministry-philosophy question as non-doctrinal", () => {
    // "Describe your discipleship philosophy" is a practice question, not a
    // doctrinal one — it should reach the answer bank, not the theology gate.
    const r = resolveQuestion({ questionText: "Describe your philosophy of discipleship." }, ctx());
    expect(r.resolution).toBe("RESOLVED");
  });

  it("detects doctrinal framing but not casual mentions", () => {
    expect(detectTheologyTopics("What do you believe about the Trinity?").length).toBeGreaterThan(0);
    expect(detectTheologyTopics("How often do you take communion with your team?").length).toBe(0);
  });
});

describe("attestations", () => {
  it("never completes a signature or certification field", () => {
    for (const q of [
      "I hereby certify that the information above is accurate.",
      "Type your full name below to sign.",
      "Do you affirm our statement of faith?",
      "I have read and agree to the church covenant.",
    ]) {
      const r = resolveQuestion({ questionText: q }, ctx());
      expect(r.resolution).toBe("ATTESTATION_REVIEW_REQUIRED");
      expect(r.answerText).toBeNull();
      expect(r.autoUsable).toBe(false);
    }
  });

  it("treats an explicit ATTESTATION field type as an attestation", () => {
    const r = resolveQuestion({ questionText: "Confirm", fieldType: "ATTESTATION" }, ctx());
    expect(r.resolution).toBe("ATTESTATION_REVIEW_REQUIRED");
  });
});

describe("candidate facts", () => {
  it("answers from an approved fact", () => {
    const r = resolveQuestion(
      { questionText: "Email address" },
      ctx({ facts: [{ path: "contact.email", label: "Email address", value: "a@example.test", status: "APPROVED" }] }),
    );
    expect(r.resolution).toBe("RESOLVED");
    expect(r.answerSource).toBe("CANDIDATE_FACT");
  });

  it("blocks on a NOT_PROVIDED fact rather than guessing", () => {
    const r = resolveQuestion(
      { questionText: "Email address" },
      ctx({ facts: [{ path: "contact.email", label: "Email address", value: null, status: "NOT_PROVIDED" }] }),
    );
    expect(r.resolution).toBe("HUMAN_INPUT_REQUIRED");
    expect(r.note).toMatch(/not permission to infer/i);
  });

  it("blocks on an UNVERIFIED_IMPORT fact", () => {
    const r = resolveQuestion(
      { questionText: "Email address" },
      ctx({ facts: [{ path: "contact.email", label: "Email address", value: "imported@example.test", status: "UNVERIFIED_IMPORT" }] }),
    );
    expect(r.resolution).toBe("HUMAN_INPUT_REQUIRED");
    expect(r.answerText).toBeNull();
  });
});

describe("question normalization", () => {
  it("normalizes punctuation and case", () => {
    expect(normalizeQuestion("What's YOUR philosophy?!")).toBe("whats your philosophy");
  });

  it("scores identical questions at 1", () => {
    expect(similarity("Describe your calling.", "Describe your calling.")).toBe(1);
  });

  it("scores unrelated questions near 0", () => {
    expect(similarity("Describe your calling.", "How many children do you have?")).toBeLessThan(0.2);
  });
});
