/**
 * The approved 100-point rubric. Weights live here alone so a change is a
 * one-line diff and the dashboard can render the rubric from the same source.
 */
export const RUBRIC = {
  ministryAlignment: { key: "ministry_alignment", label: "Ministry Alignment", max: 30 },
  theologicalAlignment: { key: "theological_alignment", label: "Theological Alignment", max: 20 },
  leadershipScope: { key: "leadership_scope", label: "Leadership Scope", max: 15 },
  churchHealth: { key: "church_health", label: "Church Health / Culture", max: 10 },
  compensation: { key: "compensation", label: "Compensation / Household Sustainability", max: 10 },
  trajectory: { key: "trajectory", label: "Opportunity / Trajectory", max: 10 },
  geography: { key: "geography", label: "Geography", max: 5 },
} as const;

/**
 * Dimensions that church research can actually resolve.
 *
 * This distinction drives the research ceiling. A dimension left UNKNOWN because
 * we have not researched the church (its doctrine, its culture) is recoverable —
 * go read the church's site and the number moves. A dimension left UNKNOWN
 * because the POSTING is vague is not: no amount of research turns a two-line
 * listing into a role with described scope.
 *
 * Counting both kinds of headroom made a thin listing outrank a fully documented
 * one, because ignorance produced more headroom than evidence did.
 */
export const RESEARCH_RESOLVABLE_DIMENSIONS: readonly string[] = [
  RUBRIC.theologicalAlignment.key,
  RUBRIC.churchHealth.key,
];

export const RUBRIC_TOTAL = Object.values(RUBRIC).reduce((sum, d) => sum + d.max, 0);

export const CLASSIFICATION_BANDS = [
  { min: 90, classification: "PRIORITY" as const },
  { min: 80, classification: "STRONG" as const },
  { min: 70, classification: "REVIEW" as const },
  { min: 0, classification: "PASS" as const },
];

export function classify(score: number) {
  return CLASSIFICATION_BANDS.find((b) => score >= b.min)!.classification;
}
