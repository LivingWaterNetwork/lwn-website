import { describe, expect, it } from "vitest";
import { computePhaseStates, computeStepsProgress, computeStreakDays } from "../../src/lib/portal/gamification";

describe("computeStepsProgress", () => {
  it("handles no steps", () => {
    expect(computeStepsProgress([])).toEqual({ done: 0, total: 0, percent: 0 });
  });

  it("rounds the percentage", () => {
    expect(computeStepsProgress([{ status: "done" }, { status: "open" }, { status: "open" }])).toEqual({
      done: 1,
      total: 3,
      percent: 33,
    });
  });
});

describe("computeStreakDays", () => {
  it("is 0 with no completions", () => {
    expect(computeStreakDays([])).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const now = new Date("2026-10-21T18:00:00Z");
    const doneAts = [
      new Date("2026-10-21T10:00:00Z"),
      new Date("2026-10-20T10:00:00Z"),
      new Date("2026-10-19T10:00:00Z"),
    ];
    expect(computeStreakDays(doneAts, now)).toBe(3);
  });

  it("still counts a streak that hasn't had today's step checked off yet", () => {
    const now = new Date("2026-10-21T08:00:00Z");
    const doneAts = [new Date("2026-10-20T10:00:00Z"), new Date("2026-10-19T10:00:00Z")];
    expect(computeStreakDays(doneAts, now)).toBe(2);
  });

  it("resets to 0 once a day is skipped", () => {
    const now = new Date("2026-10-21T18:00:00Z");
    const doneAts = [new Date("2026-10-19T10:00:00Z")];
    expect(computeStreakDays(doneAts, now)).toBe(0);
  });
});

describe("computePhaseStates", () => {
  const phases = [{ key: "see" }, { key: "sit" }, { key: "send" }];

  it("marks phases before the current one done, current as current, rest upcoming", () => {
    expect(computePhaseStates(phases, "sit").map((p) => p.state)).toEqual(["done", "current", "upcoming"]);
  });

  it("falls back to the first phase as current when nothing matches", () => {
    expect(computePhaseStates(phases, null).map((p) => p.state)).toEqual(["current", "upcoming", "upcoming"]);
  });
});
