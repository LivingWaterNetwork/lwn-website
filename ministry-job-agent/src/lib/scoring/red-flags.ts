import type { RedFlag, ScoringInput } from "../domain/types";

/**
 * Red flags are evidence-based findings that can override a numeric score.
 *
 * Two hard rules, both from the operating charter:
 *   - Every flag cites the specific text or research claim that produced it.
 *   - Nothing here infers abuse, toxicity, scandal, or misconduct. The detectors
 *     look for structural mismatches (credentials, pay, scope, doctrine) that a
 *     careful recruiter would raise, not character judgments about a church.
 */

/** Credentials a posting can require that the candidate must actually hold. */
const CREDENTIAL_REQUIREMENTS: Array<{ pattern: RegExp; credential: string }> = [
  { pattern: /\b(m\.?div|master of divinity)\b/i, credential: "MDiv" },
  { pattern: /\bordained\b|\bordination required\b/i, credential: "Ordination" },
  { pattern: /\bseminary (degree|graduate|required)\b/i, credential: "Seminary degree" },
  { pattern: /\bdoctorate|d\.?min\b/i, credential: "Doctorate" },
  { pattern: /\blicensed minister\b/i, credential: "Ministerial license" },
];

/** Doctrinal affirmations that must be candidate-approved before an application. */
const AFFIRMATION_PATTERNS: Array<{ pattern: RegExp; topic: string }> = [
  {
    // Churches word this a dozen ways — "sign our statement of faith", "agrees
    // with the C&MA Statement of Faith", "adhere to sound doctrine as expressed
    // in...", "must subscribe to our articles of faith". Matching only "sign"
    // and "affirm" let a real doctrinal-agreement requirement through unflagged.
    pattern:
      /\b(sign|signing|affirm|affirms|agree|agrees|adhere|adheres|subscribe|subscribes|align|aligns|uphold|upholds|assent)\b[^.]{0,70}\b(statement of faith|doctrinal statement|articles of faith|confession of faith|statement of belief)\b/i,
    topic: "statement of faith",
  },
  { pattern: /\bcomplementarian\b/i, topic: "complementarianism" },
  { pattern: /\begalitarian\b/i, topic: "egalitarianism" },
  { pattern: /\bcessationist\b/i, topic: "cessationism" },
  { pattern: /\bcontinuationist\b/i, topic: "continuationism" },
  { pattern: /\bfive[- ]point calvinis|\bdoctrines of grace\b/i, topic: "Calvinism" },
  { pattern: /\bbaptism by immersion required\b/i, topic: "baptism" },
  { pattern: /\bspeaking in tongues (?:is )?(?:required|expected)\b/i, topic: "spiritual gifts" },
];

const ADMIN_TERMS = [
  "administrative support",
  "clerical",
  "data entry",
  "scheduling meetings",
  "office management",
  "answer phones",
  "calendar management",
];

const PASTORAL_TERMS = [
  "shepherd",
  "pastoral care",
  "counsel",
  "preach",
  "teach",
  "disciple",
  "spiritual leadership",
];

export function detectRedFlags(input: ScoringInput): RedFlag[] {
  const flags: RedFlag[] = [];
  const body = `${input.title}\n${input.bodyText}\n${input.responsibilities.join("\n")}\n${input.qualifications.join("\n")}`;
  const lower = body.toLowerCase();

  // 1. Explicit HOLD — DO NOT APPLY.
  if (input.church.onHold) {
    flags.push({
      code: "CHURCH_ON_HOLD",
      severity: "CRITICAL",
      message: "This church is on the candidate's HOLD — DO NOT APPLY list.",
      evidence: `${input.church.name} is marked on hold in the church record.`,
      overridesClassification: true,
    });
  }

  // 2. Required credential the candidate has not approved as held.
  for (const req of CREDENTIAL_REQUIREMENTS) {
    const match = body.match(req.pattern);
    if (!match) continue;
    const held = input.candidate.approvedCredentials.some((c) =>
      c.toLowerCase().includes(req.credential.toLowerCase()),
    ) || input.candidate.approvedEducation.some((e) =>
      e.toLowerCase().includes(req.credential.toLowerCase()),
    );
    if (held) continue;

    const known = input.candidate.approvedCredentials.length + input.candidate.approvedEducation.length > 0;
    flags.push({
      code: "CREDENTIAL_GAP",
      severity: known ? "MAJOR" : "MINOR",
      message: known
        ? `Posting requires ${req.credential}, which is not present in approved candidate credentials.`
        : `Posting requires ${req.credential}; candidate credential records are empty, so this cannot be verified either way.`,
      evidence: `Posting text: "${excerpt(body, match.index ?? 0)}"`,
      overridesClassification: false,
    });
  }

  // 3. Doctrinal affirmation with no approved candidate position.
  for (const aff of AFFIRMATION_PATTERNS) {
    const match = body.match(aff.pattern);
    if (!match) continue;
    const approved = input.theology.approvedTopics.some((t) =>
      t.toLowerCase().includes(aff.topic.toLowerCase()),
    );
    if (approved) continue;
    flags.push({
      code: "UNAPPROVED_DOCTRINAL_AFFIRMATION",
      severity: "MAJOR",
      message: `Role requires affirming a position on ${aff.topic}, which is NOT YET DEFINED in the theology database.`,
      evidence: `Posting text: "${excerpt(body, match.index ?? 0)}"`,
      overridesClassification: false,
    });
  }

  // 4. Pastoral title, administrative job.
  const adminHits = ADMIN_TERMS.filter((t) => lower.includes(t));
  const pastoralHits = PASTORAL_TERMS.filter((t) => lower.includes(t));
  if (/pastor/i.test(input.title) && adminHits.length >= 2 && pastoralHits.length <= 1) {
    flags.push({
      code: "PASTORAL_TITLE_ADMIN_ROLE",
      severity: "MAJOR",
      message:
        "Titled as a pastoral role but the responsibilities read as primarily administrative.",
      evidence: `Administrative duties found: ${adminHits.join(", ")}. Pastoral duties found: ${pastoralHits.join(", ") || "none"}.`,
      overridesClassification: false,
    });
  }

  // 5. Compensation materially below the approved floor.
  const { salaryMin, salaryMax } = input.compensation;
  const midpoint =
    salaryMin != null && salaryMax != null ? (salaryMin + salaryMax) / 2 : (salaryMax ?? salaryMin ?? null);
  const floor = input.preferences.minSalary;
  if (midpoint != null && floor != null && midpoint < floor * 0.85) {
    flags.push({
      code: "COMPENSATION_BELOW_FLOOR",
      severity: midpoint < floor * 0.7 ? "CRITICAL" : "MAJOR",
      message: `Posted compensation is materially below the approved minimum.`,
      evidence: `Posted midpoint $${midpoint.toLocaleString()} vs approved minimum $${floor.toLocaleString()}.`,
      overridesClassification: midpoint < floor * 0.7,
    });
  }

  // 6. Full-time expectations at part-time pay.
  if (
    /full[- ]time/i.test(body) &&
    midpoint != null &&
    midpoint > 0 &&
    midpoint < 30000
  ) {
    flags.push({
      code: "UNREALISTIC_WORKLOAD_FOR_PAY",
      severity: "MAJOR",
      message: "Full-time role posted at compensation below a sustainable full-time floor.",
      evidence: `Posting states full-time with compensation midpoint $${midpoint.toLocaleString()}.`,
      overridesClassification: false,
    });
  }

  // 7. Governance opacity where the role's authority depends on it.
  const supervises = /(supervise|manage staff|direct report|lead team)/i.test(body);
  const governanceStated = /(elder|board|deacon|governance|reports to)/i.test(body);
  if (supervises && !governanceStated) {
    flags.push({
      code: "GOVERNANCE_UNCLEAR",
      severity: "MINOR",
      message:
        "Role carries supervisory responsibility but the posting never states the reporting or governance structure.",
      evidence: "Supervisory language present; no reporting line, elder board, or governance model described.",
      overridesClassification: false,
    });
  }

  // 8. Posting is too thin to evaluate honestly.
  if (input.bodyText.trim().length < 250 && input.responsibilities.length < 2) {
    flags.push({
      code: "INSUFFICIENT_POSTING_DETAIL",
      severity: "MINOR",
      message: "Posting is too sparse to assess responsibilities or fit with confidence.",
      evidence: `Description is ${input.bodyText.trim().length} characters with ${input.responsibilities.length} listed responsibilities.`,
      overridesClassification: false,
    });
  }

  return flags;
}

function excerpt(text: string, index: number, radius = 60): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}
