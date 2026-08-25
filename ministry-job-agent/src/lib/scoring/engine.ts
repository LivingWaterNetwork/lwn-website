import type { ScoreResult, ScoringInput } from "../domain/types";
import type { Classification } from "../domain/enums";
import { classify, RESEARCH_RESOLVABLE_DIMENSIONS, RUBRIC_TOTAL } from "./rubric";
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

  // A dimension scored around a gap is provisional, not settled. The ceiling is
  // what this role would score if those gaps closed favorably.
  //
  // Without this the workflow deadlocks: research is meant to happen for
  // opportunities likely to score 70+, but an unresearched church is capped
  // well below 70 by the theology and culture dimensions, so nothing would ever
  // qualify for the research that would let it qualify. The ceiling breaks the
  // circle without inflating the score itself.
  const unknownDimensions = dimensions.filter((d) => d.confidence === "UNKNOWN");

  // Only count headroom research can actually recover. Including headroom from
  // a vague posting would make thin listings outrank documented ones.
  const headroom = unknownDimensions
    .filter((d) => RESEARCH_RESOLVABLE_DIMENSIONS.includes(d.key))
    .reduce((sum, d) => sum + (d.max - d.awarded), 0);
  const ceiling = Math.round(Math.min(RUBRIC_TOTAL, score + headroom));

  const provisional = unknownDimensions.length > 0;
  const blockedByRedFlag = redFlags.some((f) => f.severity === "CRITICAL" && f.overridesClassification);
  const researchRecommended = provisional && !blockedByRedFlag && score < 70 && ceiling >= 70;

  return {
    score,
    classification,
    rawClassification,
    dimensions,
    redFlags,
    unknowns,
    provisional,
    ceiling,
    researchRecommended,
  };
}
