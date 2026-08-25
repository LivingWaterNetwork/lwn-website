import { describe, expect, it } from "vitest";
import { REFERENCE_STATEMENTS } from "../../src/lib/theology/references";
import { analyzeCoverage, summarizeCoverage, HIGH_PRIORITY_TOPICS } from "../../src/lib/theology/convergence";
import { THEOLOGY_TOPICS } from "../../src/lib/theology/topics";
import { resolveQuestion } from "../../src/lib/answers/resolver";

describe("reference statements", () => {
  it("every article is attributed to a real source with a URL", () => {
    for (const s of REFERENCE_STATEMENTS) {
      expect(s.organization.length).toBeGreaterThan(0);
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.articles.length).toBeGreaterThan(0);
      for (const a of s.articles) {
        expect(a.text.trim().length).toBeGreaterThan(20);
      }
    }
  });

  it("every mapped topic is a real topic in the registry", () => {
    const valid = new Set(THEOLOGY_TOPICS.map((t) => t.topic));
    for (const s of REFERENCE_STATEMENTS) {
      for (const a of s.articles) {
        for (const topic of a.topics) {
          expect(valid.has(topic), `${s.key}/${a.heading} maps to unknown topic "${topic}"`).toBe(true);
        }
      }
    }
  });
});

describe("convergence analysis", () => {
  const coverage = analyzeCoverage();

  it("covers every topic in the registry", () => {
    expect(coverage).toHaveLength(THEOLOGY_TOPICS.length);
  });

  it("flags the charismatic distinctives as divergent", () => {
    const charismatic = coverage.find((c) => c.topic.topic === "charismatic_theology")!;
    expect(charismatic.level).toBe("DIVERGENT");
    expect(charismatic.conflict).toMatch(/tongues/i);
  });

  it("flags eschatology as divergent over the rapture", () => {
    const esch = coverage.find((c) => c.topic.topic === "eschatology")!;
    expect(esch.level).toBe("DIVERGENT");
    expect(esch.conflict).toMatch(/rapture/i);
  });

  it("reports women in ministry as unaddressed by every source", () => {
    const women = coverage.find((c) => c.topic.topic === "women_in_ministry")!;
    expect(women.level).toBe("UNADDRESSED");
    expect(women.articles).toHaveLength(0);
  });

  it("surfaces high-priority topics with no coverage as critical gaps", () => {
    const summary = summarizeCoverage(coverage);
    expect(summary.criticalGaps).toContain("Women in Ministry");
    expect(summary.criticalGaps).toContain("Church Governance");
  });

  it("never marks a topic convergent on a single source", () => {
    for (const c of coverage.filter((c) => c.level === "CONVERGENT")) {
      const sources = new Set(c.articles.map((a) => a.sourceKey));
      expect(sources.size).toBeGreaterThan(1);
    }
  });

  it("keeps every high-priority topic in the registry", () => {
    const valid = new Set(THEOLOGY_TOPICS.map((t) => t.topic));
    for (const t of HIGH_PRIORITY_TOPICS) expect(valid.has(t)).toBe(true);
  });
});

describe("references never become the candidate's answers", () => {
  /**
   * The whole point of the reference system: loading someone else's statement
   * of faith must not change what the agent will say on an application.
   */
  it("a doctrinal question still blocks when only reference material exists", () => {
    const result = resolveQuestion(
      { questionText: "What do you believe about the baptism of the Holy Spirit?" },
      // Reference statements are NOT part of resolver context, by design.
      { answerBank: [], theology: [], facts: [] },
    );
    expect(result.resolution).toBe("THEOLOGICAL_REVIEW_REQUIRED");
    expect(result.answerText).toBeNull();
  });

  it("still blocks when the topic exists but the candidate has not defined it", () => {
    const result = resolveQuestion(
      { questionText: "What is your position on spiritual gifts?" },
      {
        answerBank: [],
        theology: [
          {
            topic: "spiritual_gifts",
            displayName: "Spiritual Gifts",
            status: "NOT_YET_DEFINED",
            position: null,
            shortForm: null,
            allowAutomaticUse: false,
          },
        ],
        facts: [],
      },
    );
    expect(result.resolution).toBe("THEOLOGICAL_REVIEW_REQUIRED");
  });

  it("answers only once the candidate has approved his own wording", () => {
    const result = resolveQuestion(
      { questionText: "What is your position on spiritual gifts?" },
      {
        answerBank: [],
        theology: [
          {
            topic: "spiritual_gifts",
            displayName: "Spiritual Gifts",
            status: "APPROVED",
            position: "Omar's own approved wording.",
            shortForm: null,
            allowAutomaticUse: true,
          },
        ],
        facts: [],
      },
    );
    expect(result.resolution).toBe("RESOLVED");
    expect(result.answerText).toBe("Omar's own approved wording.");
  });
});
