import { describe, expect, it } from "vitest";
import { classifyLane, MINISTRY_LANES } from "../../src/lib/domain/lanes";

/**
 * Regression tests from a real posting: Garden Church's
 * "Associate Pastor // Discipleship and House Churches".
 *
 * Exact-substring title matching classified it as Next Steps Pastor (priority
 * 13) because none of the real lane titles appear verbatim in a title with
 * punctuation and a plural.
 */
const GARDEN_TITLE = "Associate Pastor // Discipleship and House Churches";
const GARDEN_BODY = `Serve as the primary pastoral leader over our House Church network.
Support, pastor and care for House Church Leaders. Identify and train new House Church Leaders.
Develop House Church curriculum. Oversee the strategic multiplication of House Churches.
Evaluate, rebuild and oversee a new assimilation/belonging/discipleship process.
Lead the creation of a new discipleship pathway. Plan and execute baptisms.`;

describe("lane classification on messy real titles", () => {
  it("does not misclassify the Garden Church role as Next Steps", () => {
    const match = classifyLane(GARDEN_TITLE, GARDEN_BODY);
    expect(match).not.toBeNull();
    expect(match!.lane.key).not.toBe("next_steps_pastor");
  });

  it("lands the Garden Church role in a discipleship or house-church lane", () => {
    const match = classifyLane(GARDEN_TITLE, GARDEN_BODY)!;
    expect([
      "discipleship_pastor",
      "house_church_pastor",
      "associate_pastor_discipleship",
    ]).toContain(match.lane.key);
    expect(match.confidence).toBeGreaterThan(0.6);
  });

  it("sees through punctuation, plurals, and word order in titles", () => {
    expect(classifyLane("Pastor of Small Groups", "leading life groups")!.lane.key).toBe("groups_pastor");
    expect(classifyLane("Young Adults / College Pastor", "young adults ministry")!.lane.key).toMatch(/young_adults|college/);
    expect(classifyLane("Groups Pastor (Community Groups)", "community groups")!.lane.key).toMatch(/groups/);
  });

  it("weights a signal that also appears in the title more heavily", () => {
    const inTitle = classifyLane("House Church Pastor", "leading house church gatherings")!;
    const inBodyOnly = classifyLane("Pastor", "we run house church gatherings")!;
    expect(inTitle.confidence).toBeGreaterThan(inBodyOnly.confidence);
  });

  it("still classifies a role whose title gives nothing away", () => {
    const match = classifyLane(
      "Pastor of Belonging",
      "Own assimilation, baptism, the membership class, and the discipleship pathway.",
    );
    expect(match).not.toBeNull();
    expect(match!.matchedOnTitle).toBe(false);
    expect(match!.lane.key).toBe("next_steps_pastor");
  });

  it("breaks ties toward the higher-priority lane", () => {
    const match = classifyLane("Young Adults Pastor", "young adults ministry and discipleship")!;
    const laneA = MINISTRY_LANES.find((l) => l.key === match.lane.key)!;
    const rivals = MINISTRY_LANES.filter((l) => l.titles.some((t) => "young adults pastor".includes(t)));
    for (const r of rivals) expect(laneA.priority).toBeLessThanOrEqual(r.priority);
  });

  it("returns null when nothing matches at all", () => {
    expect(classifyLane("Facilities Director", "Oversee HVAC and grounds maintenance.")).toBeNull();
  });

  it("never reports confidence above 1", () => {
    const match = classifyLane(
      "Discipleship Pastor",
      "discipleship discipleship pathway spiritual formation disciple-making",
    )!;
    expect(match.confidence).toBeLessThanOrEqual(1);
  });
});

describe("trajectory signals on real posting language", () => {
  it("recognizes create/rebuild language as trajectory", async () => {
    const { scoreTrajectory } = await import("../../src/lib/scoring/dimensions");
    const input = {
      bodyText: GARDEN_BODY,
      responsibilities: [],
    } as never;
    const result = scoreTrajectory(input);
    expect(result.awarded).toBeGreaterThan(0);
    expect(result.rationale.join(" ")).toMatch(/create|rebuild|multiplication/i);
  });

  it("still scores a posting with no trajectory language at zero", async () => {
    const { scoreTrajectory } = await import("../../src/lib/scoring/dimensions");
    const input = { bodyText: "Maintain the existing calendar.", responsibilities: [] } as never;
    expect(scoreTrajectory(input).awarded).toBe(0);
  });
});
