/**
 * Builds a synthesized executive summary from a Business Stewardship
 * Discovery submission's raw answers, for the top of the notification
 * email. Purely templated (no AI call) — deterministic so it's fast,
 * free, and predictable in every email. Mirrors the same Current State →
 * Desired State → Strategy → Risk framework used in the discovery form
 * itself and in the manual meeting-prep doc.
 */

type Answers = Record<string, string>;

const CAPACITY_LABELS: Record<string, string> = {
  "close-to-capacity": "fairly close to capacity — little room for more without changes",
  "1-2-per-week": "1–2 additional jobs/week of room",
  "3-5-per-week": "3–5 additional jobs/week of room",
  "6-plus-per-week": "6+ additional jobs/week of room",
  "double-volume": "could roughly double current volume",
  "not-sure": "not sure of his capacity ceiling yet",
};

const PRIORITY_LABELS: Record<string, string> = {
  "more-revenue": "More total revenue",
  "more-consistent-work": "More consistent weekly work",
  "higher-value-jobs": "Higher-value jobs",
  "more-partnerships": "More strategic referral partnerships",
  "fewer-dependencies": "Building systems so the company depends less on him",
  "prep-to-scale": "Preparing the company to scale",
  combination: "A combination (see ranking below)",
};

const COMFORT_LABELS: Record<string, string> = {
  "very-comfortable": "very comfortable",
  "comfortable-but-diversify": "comfortable, but wants diversification",
  "somewhat-concerned": "somewhat concerned",
  "very-concerned": "very concerned about depending on a small number of sources",
  "havent-thought-about-it": "hasn't really thought about it",
};

const ADD_EMPLOYEES_LABELS: Record<string, string> = {
  yes: "Yes",
  no: "No",
  maybe: "Maybe",
};

function val(answers: Answers, key: string): string {
  const v = answers[key];
  return v && v.trim().length > 0 ? v.trim() : "—";
}

function label(map: Record<string, string>, rawValue: string): string {
  const v = rawValue?.trim();
  if (!v) return "—";
  return map[v] ?? v;
}

export function buildDiscoveryExecutiveSummary(answers: Answers): string {
  const flags: string[] = [];
  if (["somewhat-concerned", "very-concerned"].includes(answers.partnershipComfort?.trim())) {
    flags.push("⚠ Referral concentration risk — he's flagged discomfort with how much volume rides on a small number of sources.");
  }
  if (answers.capacityCeiling?.trim() === "close-to-capacity") {
    flags.push("⚠ Limited capacity headroom — consider systems/scheduling or job value before adding new lead volume.");
  }
  if (answers.hiringThreshold?.trim().toLowerCase().includes("don't know") || answers.hiringThreshold?.trim().toLowerCase().includes("dont know")) {
    flags.push("⚠ No hiring threshold defined yet — worth nailing down together before promising growth the crew can't absorb.");
  }

  return `
EXECUTIVE SUMMARY (auto-generated from his answers)

CURRENT STATE
  Team depending on the business: ${val(answers, "teamDependents")}
  Employees / contractors: ${val(answers, "employeeCount")} / ${val(answers, "contractorCount")} (${val(answers, "employmentType")})
  Primary roles: ${val(answers, "primaryRoles")}
  Crew utilization now: ${val(answers, "currentUtilizationDays")}
  Capacity for more work right now: ${label(CAPACITY_LABELS, answers.capacityCeiling)}
  Hiring threshold: ${val(answers, "hiringThreshold")}

DESIRED STATE — 90 days out
  Ideal jobs/week: ${val(answers, "idealJobsPerWeek")}  |  Ideal crew days/week: ${val(answers, "idealCrewDaysPerWeek")}
  Ideal avg job value: ${val(answers, "idealAvgJobValue")}  |  Ideal # referral channels: ${val(answers, "idealReferralChannels")}
  Would add employees: ${label(ADD_EMPLOYEES_LABELS, answers.wouldAddEmployees)}
  In his own words — "this worked": ${val(answers, "ninetyDayVision")}

STRATEGY SIGNAL
  Top 90-day priority: ${label(PRIORITY_LABELS, answers.priorityNext90Days)}
  Ranking (if combination): ${val(answers, "priorityRanking")}
  Replicate-partnership targets: ${val(answers, "replicatePartnershipTypes")}
  Other current partnerships: ${val(answers, "otherPartnerships")}
  Other services: ${val(answers, "otherServices")}

RISK / STEWARDSHIP
  Comfort with referral concentration: ${label(COMFORT_LABELS, answers.partnershipComfort)}
  Stated impact if a relationship stopped: ${val(answers, "partnershipRiskImpact")}
${flags.length > 0 ? "\n" + flags.join("\n") : "  No flags raised."}
`.trim();
}
