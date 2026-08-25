import type { ScoreResult, ScoringInput } from "../domain/types";
import type { Classification } from "../domain/enums";
import { classify, RUBRIC_TOTAL } from "./rubric";
import { detectRedFlags } from "./red-flags";
import {
  scoreChurchHealth,
  scoreCompensation,
  scoreGeography,
  scoreLeadershipScope,
  scoreMinistryAlignment,
  scoreTheologicalAlignment,
  scoreTrajectory,
} from "./dimensions";

const ORDER: Classification[] = ["PRIORITY", "STRONG", "REVIEW", "PASS"];

function demote(from: Classification, steps: number): Classification {
  const i = ORDER.indexOf(from);
  return ORDER[Math.min(ORDER.length - 1, i + steps)]!;
}

/**
 * Score an opportunity out of 100 and classify it.
 *
 * Red flags apply after the numeric score: a CRITICAL flag drops the
 * classification straight to PASS regardless of points, because a church on the
 * HOLD list or a role paying well under the floor is not a "90" no matter how
 * well the responsibilities read. MAJOR flags demote one band each, to a floor
 * of REVIEW — they are concerns to weigh, not disqualifications.
 */
export function scoreOpportunity(input: ScoringInput): ScoreResult {
  const dimensions = [
    scoreMinistryAlignment(input),
    scoreTheologicalAlignment(input),
    scoreLeadershipScope(input),
    scoreChurchHealth(input),
    scoreCompensation(input),
    scoreTrajectory(input),
    scoreGeography(input),
  ];

  const total = dimensions.reduce((sum, d) => sum + d.awarded, 0);
  const score = Math.round(Math.max(0, Math.min(RUBRIC_TOTAL, total)));

  const redFlags = detectRedFlags(input);
  const rawClassification = classify(score);

  let classification = rawClassification;
  if (redFlags.some((f) => f.severity === "CRITICAL" && f.overridesClassification)) {
    classification = "PASS";
  } else {
    const majors = redFlags.filter((f) => f.severity === "MAJOR").length;
    if (majors > 0) {
      const demoted = demote(rawClassification, majors);
      // MAJOR flags never push below REVIEW on their own; the score does that.
      classification = ORDER.indexOf(demoted) > ORDER.indexOf("REVIEW") ? rawClassification : demoted;
    }
  }

  const unknowns = Array.from(new Set(dimensions.flatMap((d) => d.unknowns)));

  return { score, classification, rawClassification, dimensions, redFlags, unknowns };
}
