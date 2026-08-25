import type { DimensionScore, ScoringInput } from "../domain/types";
import { LANE_BY_KEY } from "../domain/lanes";
import { RUBRIC } from "./rubric";

/**
 * Each dimension is a pure function of ScoringInput. Two rules apply throughout:
 *
 *  - Missing evidence never earns full marks. A dimension we cannot evaluate
 *    returns confidence "UNKNOWN" and a partial award, and names the gap.
 *  - Rationale strings are user-facing. They appear verbatim in the report, so
 *    they say what was found, not what was assumed.
 */

const contains = (haystack: string, needles: string[]) =>
  needles.filter((n) => haystack.includes(n));

/**
 * Ministry emphases the candidate is positioned around, weighted by centrality.
 *
 * Matched by pattern, not literal phrase. Churches say "raise up new leaders",
 * "growth groups", "18-29", "disciple-making" — none of which a substring list
 * built around "develop leaders", "small groups", "young adults" and
 * "discipleship" would catch. This is the heaviest dimension in the rubric at
 * 30 points, so a miss here dominates the whole score.
 */
const CORE_EMPHASES: Array<{ pattern: RegExp; weight: number; label: string }> = [
  { pattern: /\bspiritual formation\b|\bformation\b/i, weight: 3, label: "spiritual formation" },
  { pattern: /\bdisciple(ship|-making|making|s|d|ing)?\b/i, weight: 3, label: "discipleship" },
  {
    pattern: /\byoung adults?\b|\b20s and 30s\b|\btwenties\b|\b1[89]\s*[-–]\s*(29|30|35)\b|\bemerging adults?\b|\bpost[- ]college\b|\bcollege (students|ministry)\b/i,
    weight: 3,
    label: "young adults",
  },
  {
    pattern: /\b(small|life|community|growth|connection|home|missional)\s+groups?\b|\bgroup (leaders?|ministry)\b|\bmissional communit/i,
    weight: 2.5,
    label: "groups ministry",
  },
  {
    pattern: /\bleader(ship)? development\b|\b(develop|equip|train|coach|mentor|raise up)\b[^.]{0,35}\b(leaders?|directors?)\b/i,
    weight: 2.5,
    label: "leadership development",
  },
  { pattern: /\bvolunteers?\b/i, weight: 2, label: "volunteer development" },
  { pattern: /\bmultipl(y|ying|ication|es)\b/i, weight: 2, label: "multiplication" },
  { pattern: /\bequip(ping|s|ped)?\b/i, weight: 2, label: "equipping" },
  { pattern: /\bcommunity\b|\bbelonging\b/i, weight: 1.5, label: "community" },
  { pattern: /\bpastoral care\b|\bshepherd(ing|s)?\b/i, weight: 1.5, label: "pastoral care" },
  { pattern: /\bspiritual disciplines\b|\bscripture engagement\b/i, weight: 1.5, label: "spiritual disciplines" },
  { pattern: /\bprayer\b/i, weight: 1, label: "prayer" },
  { pattern: /\bleader care\b|\bcare for [^.]{0,20}leaders\b/i, weight: 1.5, label: "leader care" },
  {
    pattern: /\bdiscipleship pathway\b|\bnext steps\b|\bgrowth path(way)?\b|\bassimilation\b/i,
    weight: 3,
    label: "discipleship pathway",
  },
];

/** Signals the role is mostly programming and logistics rather than formation. */
const EVENT_HEAVY_TERMS = [
  "event planning",
  "event coordination",
  "calendar management",
  "logistics",
  "social calendar",
  "activities coordinator",
];

export function scoreMinistryAlignment(input: ScoringInput): DimensionScore {
  const { max, key, label } = RUBRIC.ministryAlignment;
  const body = `${input.title}\n${input.bodyText}\n${input.responsibilities.join("\n")}`.toLowerCase();
  const rationale: string[] = [];
  const unknowns: string[] = [];

  // Lane priority: the candidate's top lanes are worth more than the tail.
  const lane = input.lane ? LANE_BY_KEY.get(input.lane) : undefined;
  let lanePoints = 0;
  if (lane) {
    // Lane 1 -> 12 pts, lane 20 -> ~4 pts, scaled by classification confidence.
    const laneBase = 12 - ((lane.priority - 1) / 19) * 8;
    lanePoints = laneBase * Math.max(0.5, input.laneConfidence);
    rationale.push(
      `Maps to the ${lane.label} lane (priority ${lane.priority}), confidence ${(input.laneConfidence * 100).toFixed(0)}%.`,
    );
  } else {
    unknowns.push("Role does not map cleanly to a primary ministry lane.");
    rationale.push("No primary ministry lane matched; scored on responsibilities alone.");
  }

  // Emphasis coverage: what the role actually asks the person to do.
  const matched = CORE_EMPHASES.filter((e) => e.pattern.test(body));
  const weightSum = matched.reduce((sum, e) => sum + e.weight, 0);
  // 16 weighted points of emphasis coverage saturates this component.
  const emphasisPoints = Math.min(14, (weightSum / 16) * 14);
  if (matched.length > 0) {
    rationale.push(
      `Responsibilities emphasize: ${Array.from(new Set(matched.map((m) => m.label))).join(", ")}.`,
    );
  } else {
    unknowns.push("Posting text names none of the candidate's core ministry emphases.");
  }

  // Penalty when the role reads as event management wearing a pastoral title.
  const eventHits = contains(body, EVENT_HEAVY_TERMS);
  const formationDepth = matched.filter((m) => m.weight >= 2.5).length;
  let penalty = 0;
  if (eventHits.length >= 2 && formationDepth <= 1) {
    penalty = 4;
    rationale.push(
      `Reduced ${penalty} pts: posting leans on ${eventHits.join(", ")} without substantive formation or discipleship responsibility.`,
    );
  }

  // Bonus where the posting explicitly owns a discipleship or formation pathway.
  let bonus = 0;
  if (/\bdiscipleship pathway\b|\bspiritual formation\b/i.test(body)) {
    bonus = 4;
    rationale.push("Bonus 4 pts: role explicitly owns a formation or discipleship pathway.");
  }

  const awarded = clamp(lanePoints + emphasisPoints + bonus - penalty, 0, max);
  return {
    key,
    label,
    awarded: round1(awarded),
    max,
    confidence: matched.length >= 3 ? "HIGH" : matched.length >= 1 ? "MEDIUM" : "UNKNOWN",
    rationale,
    unknowns,
  };
}

/**
 * Theological alignment never awards full marks on silence.
 *
 * The rule from the operating charter: if theology is unknown, do NOT
 * automatically award full points. So the ceiling here is gated by two things —
 * whether the church's doctrine was actually found, and whether the candidate
 * has APPROVED positions to compare it against.
 */
export function scoreTheologicalAlignment(input: ScoringInput): DimensionScore {
  const { max, key, label } = RUBRIC.theologicalAlignment;
  const rationale: string[] = [];
  const unknowns: string[] = [];

  const churchKnown = input.theology.statementOfFaithFound || input.theology.churchSignals.length > 0;
  const candidateKnown = input.theology.approvedTopics.length;

  if (!churchKnown) {
    unknowns.push("Church statement of faith not located — theological compatibility unverified.");
  } else {
    rationale.push(
      input.theology.statementOfFaithFound
        ? "Statement of faith located and reviewed."
        : "Doctrinal signals found in public materials, but no formal statement of faith.",
    );
  }

  if (candidateKnown === 0) {
    unknowns.push(
      "Candidate theology database is empty — no approved positions exist to compare against.",
    );
  } else {
    rationale.push(`${candidateKnown} approved candidate theological position(s) available for comparison.`);
  }

  // Ceiling ladder. Full marks require both sides to be known.
  let ceiling: number;
  if (!churchKnown && candidateKnown === 0) ceiling = max * 0.4; // 8/20
  else if (!churchKnown || candidateKnown === 0) ceiling = max * 0.6; // 12/20
  else ceiling = max;

  // Broad-evangelical compatibility signal. Presence is positive but weak on its own.
  const compatibleSignals = [
    "authority of scripture",
    "inerrancy",
    "trinity",
    "salvation by grace",
    "great commission",
    "gospel-centered",
    "priesthood of all believers",
  ];
  const hits = input.theology.churchSignals.filter((s) =>
    compatibleSignals.some((c) => s.includes(c)),
  );
  if (hits.length) rationale.push(`Compatible doctrinal signals: ${hits.join("; ")}.`);

  // How much of the ceiling the evidence actually earns. Even a fully-known,
  // clearly compatible church stops short of a perfect 20: the system has read a
  // statement of faith, not conducted the doctrinal conversation an interview will.
  let evidenceFraction: number;
  if (churchKnown && candidateKnown > 0) {
    evidenceFraction = Math.min(1, 0.85 + Math.min(hits.length, 3) * 0.05);
  } else if (churchKnown) {
    evidenceFraction = Math.min(1, 0.75 + Math.min(hits.length, 3) * 0.05);
  } else {
    evidenceFraction = 0.6;
  }
  const awarded = clamp(ceiling * evidenceFraction, 0, max);

  const confidence: DimensionScore["confidence"] =
    churchKnown && candidateKnown > 0 ? "HIGH" : churchKnown || candidateKnown > 0 ? "MEDIUM" : "UNKNOWN";

  if (confidence !== "HIGH") {
    rationale.push(
      `Capped at ${round1(ceiling)}/${max}: unknown theology does not earn full marks.`,
    );
  }

  return { key, label, awarded: round1(awarded), max, confidence, rationale, unknowns };
}

/**
 * A scored signal matched by pattern rather than exact phrase.
 *
 * Naive substring matching was missing most real postings: a list containing
 * "develop leaders" does not match "develop and equip group leaders", and
 * "strategic" does not match "lead vision and strategy". Church postings phrase
 * the same responsibility a dozen ways, so these match the concept.
 */
interface PatternSignal {
  pattern: RegExp;
  points: number;
  note: string;
}

function matchSignals(text: string, signals: PatternSignal[]) {
  const hits = signals.filter((s) => s.pattern.test(text));
  const raw = hits.reduce((sum, h) => sum + h.points, 0);
  const notes = Array.from(new Set(hits.map((h) => h.note)));
  return { hits, raw, notes };
}

const SCOPE_SIGNALS: PatternSignal[] = [
  {
    pattern: /\b(own|lead|develop|shape|set|create|drive|cast)\b[^.]{0,30}\b(vision|strateg)/i,
    points: 3,
    note: "owns vision or strategy",
  },
  { pattern: /\bstrategic(ally)?\b/i, points: 1.5, note: "strategic responsibility" },
  {
    pattern: /\b(build|building|form|assemble|grow)\b[^.]{0,25}\bteams?\b/i,
    points: 2,
    note: "team building",
  },
  { pattern: /\brecruit/i, points: 1.5, note: "recruiting leaders" },
  {
    // "develop leaders", "equip group leaders", "train and support leaders",
    // "coach ministry directors", "raise up volunteers" — all one concept.
    pattern: /\b(develop|equip|train|coach|mentor|coaching|raise up|invest in|support)\b[^.]{0,35}\b(leaders?|directors?|volunteers?|teams?)\b/i,
    points: 3,
    note: "leader development",
  },
  { pattern: /\bleadership development\b/i, points: 2.5, note: "leader development" },
  { pattern: /\bvolunteers?\b/i, points: 1.5, note: "volunteer leadership" },
  {
    pattern: /\b(supervise|supervisory|manage|managing|oversee|overseeing|lead and coach)\b[^.]{0,35}\b(staff|directors?|reports?|teams?|team members?|ministries)\b/i,
    points: 2.5,
    note: "staff supervision",
  },
  { pattern: /\bdirect reports?\b/i, points: 2, note: "staff supervision" },
  { pattern: /\bteach(ing|es)?\b/i, points: 2, note: "teaching responsibility" },
  { pattern: /\bpreach(ing|es)?\b/i, points: 2, note: "preaching responsibility" },
  {
    pattern: /\bpastoral care\b|\bcounsel(ing|ling)?\b|\bvisitation\b|\bweddings?\b|\bfunerals?\b/i,
    points: 1.5,
    note: "pastoral care",
  },
  { pattern: /\bbudget/i, points: 1.5, note: "budget ownership" },
  {
    pattern: /\b(lead(ership)? team|executive (team|leadership)|elder (board|team)|servant leadership team|pastors'? board)\b/i,
    points: 2,
    note: "seat on a leadership team",
  },
  { pattern: /\boversee\b|\boversight\b/i, points: 1, note: "ministry oversight" },
];

export function scoreLeadershipScope(input: ScoringInput): DimensionScore {
  const { max, key, label } = RUBRIC.leadershipScope;
  const body = `${input.bodyText}\n${input.responsibilities.join("\n")}\n${input.qualifications.join("\n")}`;
  const rationale: string[] = [];
  const unknowns: string[] = [];

  const { hits, raw, notes } = matchSignals(body, SCOPE_SIGNALS);

  if (hits.length === 0) {
    unknowns.push("Posting does not describe scope of authority, team, or teaching.");
  } else {
    rationale.push(`Scope includes: ${notes.join(", ")}.`);
  }

  // 18 raw signal points saturates the dimension.
  const awarded = clamp((raw / 18) * max, 0, max);

  if (/\bunder the direction of\b/i.test(body) && !/\bstrateg/i.test(body)) {
    rationale.push("Role appears execution-oriented rather than strategy-owning.");
  }

  return {
    key,
    label,
    awarded: round1(awarded),
    max,
    confidence: hits.length >= 5 ? "HIGH" : hits.length >= 2 ? "MEDIUM" : "UNKNOWN",
    rationale,
    unknowns,
  };
}

export function scoreChurchHealth(input: ScoringInput): DimensionScore {
  const { max, key, label } = RUBRIC.churchHealth;
  const rationale: string[] = [];
  const unknowns: string[] = [];

  if (!input.church.researched) {
    unknowns.push("Church has not been researched yet — culture assessed at baseline only.");
    return {
      key,
      label,
      awarded: round1(max * 0.4),
      max,
      confidence: "UNKNOWN",
      rationale: ["Baseline award pending research. No culture conclusions drawn from an unresearched church."],
      unknowns,
    };
  }

  const verified = input.cultureClaims.filter((c) => c.kind === "VERIFIED_FACT");
  const inferences = input.cultureClaims.filter((c) => c.kind === "INFERENCE");

  const positives = verified.filter((c) =>
    /value|clarity|accountab|team|develop|care|health|elder|board|transparen/i.test(c.claim),
  );
  const concerns = inferences.filter((c) => /concern|unclear|ambigu|conflict|turnover/i.test(c.claim));

  // 60% baseline for a researched church, then evidence moves it.
  let awarded = max * 0.6 + Math.min(3, positives.length) * (max * 0.13) - Math.min(2, concerns.length) * (max * 0.15);
  awarded = clamp(awarded, 0, max);

  if (positives.length) {
    rationale.push(`Verified positives: ${positives.map((p) => p.claim).slice(0, 3).join("; ")}.`);
  }
  if (concerns.length) {
    rationale.push(
      `Open questions (inference, not fact): ${concerns.map((c) => c.claim).slice(0, 2).join("; ")}.`,
    );
  }
  if (!positives.length && !concerns.length) {
    unknowns.push("Research found no substantive public statements about leadership culture.");
  }

  return {
    key,
    label,
    awarded: round1(awarded),
    max,
    confidence: verified.length >= 3 ? "HIGH" : verified.length >= 1 ? "MEDIUM" : "UNKNOWN",
    rationale,
    unknowns,
  };
}

/** Compensation is scored only when disclosed. Silence is marked unknown, not penalized to zero. */
export function scoreCompensation(input: ScoringInput): DimensionScore {
  const { max, key, label } = RUBRIC.compensation;
  const rationale: string[] = [];
  const unknowns: string[] = [];
  const { salaryMin, salaryMax, benefits, housingNote, relocationNote } = input.compensation;

  const disclosed = salaryMin != null || salaryMax != null;
  if (!disclosed) {
    unknowns.push("Compensation not disclosed in the posting.");
    if (benefits.length === 0) unknowns.push("Benefits not disclosed.");
    // Half marks with UNKNOWN confidence: cannot reward or punish what wasn't stated.
    return {
      key,
      label,
      awarded: round1(max * 0.5),
      max,
      confidence: "UNKNOWN",
      rationale: ["Salary unknown — scored neutrally and flagged for direct inquiry."],
      unknowns,
    };
  }

  const midpoint = salaryMin != null && salaryMax != null ? (salaryMin + salaryMax) / 2 : (salaryMax ?? salaryMin)!;
  rationale.push(`Posted compensation midpoint: $${midpoint.toLocaleString()}.`);

  const min = input.preferences.minSalary;
  const preferred = input.preferences.preferredSalary;

  let salaryPoints: number;
  if (min == null && preferred == null) {
    unknowns.push("Candidate salary requirements not yet approved — cannot judge sufficiency.");
    salaryPoints = max * 0.55;
    rationale.push("Candidate salary floor is undefined; sufficiency not yet assessable.");
  } else if (min != null && midpoint < min) {
    salaryPoints = max * 0.15;
    rationale.push(`Below the approved minimum of $${min.toLocaleString()}.`);
  } else if (preferred != null && midpoint >= preferred) {
    salaryPoints = max * 0.8;
    rationale.push(`Meets or exceeds the preferred target of $${preferred.toLocaleString()}.`);
  } else {
    salaryPoints = max * 0.6;
    rationale.push("Above the approved minimum but below the preferred target.");
  }

  const benefitBonus = Math.min(2, benefits.length * 0.5);
  if (benefits.length) rationale.push(`Benefits listed: ${benefits.join(", ")}.`);
  const housingBonus = housingNote ? 0.5 : 0;
  const relocationBonus = relocationNote ? 0.5 : 0;
  if (relocationNote) rationale.push(`Relocation: ${relocationNote}.`);

  const awarded = clamp(salaryPoints + benefitBonus + housingBonus + relocationBonus, 0, max);
  return {
    key,
    label,
    awarded: round1(awarded),
    max,
    confidence: min != null || preferred != null ? "HIGH" : "MEDIUM",
    rationale,
    unknowns,
  };
}

const TRAJECTORY_SIGNALS: PatternSignal[] = [
  { pattern: /\bfrom the ground up\b|\bgreen ?field\b/i, points: 2.5, note: "green-field ministry to build" },
  {
    // "create a new pathway", "rebuild the process", "launch groups",
    // "build systems" — the structure does not exist yet and this hire owns it.
    pattern: /\b(creat(e|ing|ion)|build|building|establish|launch|start|develop|design)\b[^.]{0,40}\b(new|systems?|process(es)?|pathway|structure|platform|strategy|curriculum)\b/i,
    points: 3,
    note: "authority to design and build",
  },
  { pattern: /\bre-?build|\bre-?imagine|\bre-?design|\bevaluate,? ?(and )?(re)?build/i, points: 2.5, note: "mandate to rebuild an existing system" },
  { pattern: /\bmultiplication\b|\bmultiply(ing)?\b/i, points: 2, note: "multiplication mandate" },
  { pattern: /\bexpan(d|sion)\b|\bgrowth\b|\bgrowing\b/i, points: 1.5, note: "growth or expansion mandate" },
  { pattern: /\bmulti-?site\b|\bcampus(es)?\b/i, points: 1.5, note: "multisite organization" },
  {
    pattern: /\b(reports?|reporting|partners?|partnering|works?|working)\b[^.]{0,40}\b(lead pastor|executive pastor|senior pastor|executive leadership|elders?)\b/i,
    points: 2.5,
    note: "proximity to senior leadership",
  },
  { pattern: /\b(lead(ership)? team|executive team|servant leadership team)\b/i, points: 2, note: "seat on the lead team" },
  { pattern: /\bordination\b|\bresidency\b/i, points: 1, note: "development or ordination pathway" },
];

export function scoreTrajectory(input: ScoringInput): DimensionScore {
  const { max, key, label } = RUBRIC.trajectory;
  const body = `${input.bodyText}\n${input.responsibilities.join("\n")}\n${input.qualifications.join("\n")}`;
  const rationale: string[] = [];
  const unknowns: string[] = [];

  const { hits, raw, notes } = matchSignals(body, TRAJECTORY_SIGNALS);

  if (hits.length) {
    rationale.push(`Trajectory signals: ${notes.join(", ")}.`);
  } else {
    unknowns.push("Posting says little about growth path, authority, or organizational influence.");
  }

  const awarded = clamp((raw / 11) * max, 0, max);
  return {
    key,
    label,
    awarded: round1(awarded),
    max,
    confidence: hits.length >= 3 ? "HIGH" : hits.length >= 1 ? "MEDIUM" : "UNKNOWN",
    rationale,
    unknowns,
  };
}

/**
 * Geography is worth 5 points and the candidate is open to relocation nationwide,
 * so this dimension is deliberately gentle. It exists to break ties, not to
 * eliminate opportunities. No role is ever rejected on location alone.
 */
export function scoreGeography(input: ScoringInput): DimensionScore {
  const { max, key, label } = RUBRIC.geography;
  const rationale: string[] = [];
  const unknowns: string[] = [];
  const { state } = input.location;

  if (!state) {
    unknowns.push("Location not specified in the posting.");
    return {
      key,
      label,
      awarded: round1(max * 0.6),
      max,
      confidence: "UNKNOWN",
      rationale: ["Location unspecified; not penalized."],
      unknowns,
    };
  }

  const prefs = input.preferences;
  let awarded = max * 0.8; // Nationwide default: almost everywhere is acceptable.
  if (prefs.states.length && prefs.states.includes(state)) {
    awarded = max;
    rationale.push(`${state} is on the candidate's preferred-state list.`);
  } else if (prefs.states.length && !prefs.nationwide) {
    awarded = max * 0.4;
    rationale.push(`${state} is outside the currently configured state filter.`);
  } else {
    rationale.push(`${state} is within a nationwide search; candidate is open to relocation.`);
  }

  if (!input.candidate.relocationOpen && state !== "GA") {
    awarded = max * 0.3;
    rationale.push("Relocation is currently switched off in preferences.");
  }

  return { key, label, awarded: round1(awarded), max, confidence: "HIGH", rationale, unknowns };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}
