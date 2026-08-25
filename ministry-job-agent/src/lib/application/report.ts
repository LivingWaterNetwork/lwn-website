import type { DimensionScore, RedFlag } from "../domain/types";
import { laneLabel } from "../domain/lanes";

/**
 * The standardized opportunity report, produced for anything scoring 70+.
 *
 * Every field is either populated from evidence or says "NOT PROVIDED". There is
 * no field the system fills with a plausible guess, which is why the report is
 * safe to read as a decision document.
 */

export interface ReportInput {
  church: string;
  position: string;
  location: string;
  sources: Array<{ source: string; url: string; isCanonical: boolean }>;
  canonicalUrl: string | null;
  dateFound: Date;
  postedDate: Date | null;
  deadline: Date | null;
  score: number | null;
  classification: string | null;
  lane: string | null;
  dimensions: DimensionScore[];
  redFlags: RedFlag[];
  unknowns: string[];
  compensation: { min: number | null; max: number | null; note: string | null };
  benefits: string[];
  relocationNote: string | null;
  housingNote: string | null;
  qualifications: string[];
  approvedCredentials: string[];
  resumeVariant: { key: string; name: string; rationale: string } | null;
  coverLetterAngle: string | null;
  portfolio: Array<{ name: string; reason: string }>;
  applicationQuestions: Array<{ question: string; resolution: string; answer: string | null }>;
  humanInputs: Array<{ kind: string; question: string }>;
  status: string;
  followUpDate: Date | null;
  cultureNotes: Array<{ claim: string; kind: string; sourceUrl?: string | null }>;
  theologyNotes: Array<{ claim: string; sourceUrl?: string | null }>;
  statementOfFaithUrl: string | null;
}

const NP = "NOT PROVIDED";

const fmtDate = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : NP);
const fmtList = (items: string[]) => (items.length ? items.map((i) => `- ${i}`).join("\n") : `- ${NP}`);

function money(min: number | null, max: number | null, note: string | null): string {
  if (min == null && max == null) return note ?? `${NP} — not disclosed in the posting`;
  if (min != null && max != null) return `$${min.toLocaleString()} – $${max.toLocaleString()}${note ? ` (${note})` : ""}`;
  const one = (max ?? min)!;
  return `$${one.toLocaleString()}${note ? ` (${note})` : ""}`;
}

/** Render the report as Markdown, suitable for the dashboard and for ./jobs. */
export function renderReport(r: ReportInput): string {
  const dim = (key: string) => r.dimensions.find((d) => d.key === key);
  const dimBlock = (key: string) => {
    const d = dim(key);
    if (!d) return NP;
    const lines = [`${d.awarded}/${d.max} (confidence: ${d.confidence})`];
    for (const rat of d.rationale) lines.push(`  - ${rat}`);
    for (const u of d.unknowns) lines.push(`  - UNKNOWN: ${u}`);
    return lines.join("\n");
  };

  const qualificationGaps = r.qualifications.filter((q) => {
    const lower = q.toLowerCase();
    if (!/(required|must|degree|ordain|mdiv|master)/.test(lower)) return false;
    return !r.approvedCredentials.some((c) => lower.includes(c.toLowerCase()));
  });

  return `# ${r.church} — ${r.position}

**CHURCH**: ${r.church}
**POSITION**: ${r.position}${r.lane ? ` (lane: ${laneLabel(r.lane)})` : ""}
**LOCATION**: ${r.location || NP}
**SOURCE**: ${r.sources.length ? r.sources.map((s) => s.source).join(", ") : NP}
**CANONICAL JOB URL**: ${r.canonicalUrl ?? NP}
**DATE FOUND**: ${fmtDate(r.dateFound)}
**POSTED DATE**: ${fmtDate(r.postedDate)}
**APPLICATION DEADLINE**: ${fmtDate(r.deadline)}
**SCORE**: ${r.score ?? NP}/100
**CLASSIFICATION**: ${r.classification ?? NP}

## WHY IT FITS
${dim("ministry_alignment")?.rationale.map((x) => `- ${x}`).join("\n") || `- ${NP}`}

## MINISTRY ALIGNMENT
${dimBlock("ministry_alignment")}

## THEOLOGICAL ALIGNMENT
${dimBlock("theological_alignment")}

Statement of faith: ${r.statementOfFaithUrl ?? `${NP} — not located`}
${r.theologyNotes.length ? r.theologyNotes.map((t) => `- ${t.claim}${t.sourceUrl ? ` (${t.sourceUrl})` : ""}`).join("\n") : `- ${NP}`}

## LEADERSHIP OPPORTUNITY
${dimBlock("leadership_scope")}

## CULTURE NOTES
${
  r.cultureNotes.length
    ? r.cultureNotes
        .map((c) => `- [${c.kind === "VERIFIED_FACT" ? "VERIFIED FACT" : "INFERENCE / POTENTIAL CONCERN"}] ${c.claim}${c.sourceUrl ? ` — ${c.sourceUrl}` : ""}`)
        .join("\n")
    : `- ${NP} — church not yet researched`
}

## COMPENSATION
${money(r.compensation.min, r.compensation.max, r.compensation.note)}

${dimBlock("compensation")}

## BENEFITS
${fmtList(r.benefits)}

## RELOCATION CONSIDERATIONS
${r.relocationNote ?? `${NP} — relocation assistance not stated`}
Housing: ${r.housingNote ?? NP}
${dimBlock("geography")}

## QUALIFICATION MATCH
Posting requires:
${fmtList(r.qualifications)}

Approved candidate credentials on file:
${fmtList(r.approvedCredentials.length ? r.approvedCredentials : [`${NP} — candidate credential records are empty`])}

Apparent gaps (verify — the credential database may simply be unpopulated):
${fmtList(qualificationGaps)}

## CONCERNS
${
  r.redFlags.filter((f) => f.severity === "MINOR").length
    ? r.redFlags.filter((f) => f.severity === "MINOR").map((f) => `- ${f.message} (${f.evidence})`).join("\n")
    : "- None recorded."
}

## RED FLAGS
${
  r.redFlags.filter((f) => f.severity !== "MINOR").length
    ? r.redFlags
        .filter((f) => f.severity !== "MINOR")
        .map((f) => `- **${f.severity}** ${f.code}: ${f.message}\n  Evidence: ${f.evidence}`)
        .join("\n")
    : "- None recorded."
}

## UNKNOWN INFORMATION
${fmtList(r.unknowns)}

## RECOMMENDED ACTION
${recommendedAction(r)}

## RECOMMENDED RESUME VERSION
${r.resumeVariant ? `${r.resumeVariant.name} (${r.resumeVariant.key}) — ${r.resumeVariant.rationale}` : NP}

## RECOMMENDED COVER LETTER ANGLE
${r.coverLetterAngle ?? NP}

## RECOMMENDED PORTFOLIO MATERIAL
${r.portfolio.length ? r.portfolio.map((p) => `- ${p.name} — ${p.reason}`).join("\n") : `- ${NP}`}

## APPLICATION QUESTIONS
${
  r.applicationQuestions.length
    ? r.applicationQuestions
        .map((q) => `- [${q.resolution}] ${q.question}${q.answer ? `\n  → ${truncate(q.answer, 160)}` : ""}`)
        .join("\n")
    : "- Not yet captured. Run the browser capture pass to collect the form's questions."
}

## HUMAN INPUT REQUIRED
${
  r.humanInputs.length
    ? r.humanInputs.map((h) => `- [${h.kind}] ${h.question}`).join("\n")
    : "- None outstanding."
}

## APPLICATION STATUS
${r.status}

## FOLLOW-UP DATE
${fmtDate(r.followUpDate)}
`;
}

function recommendedAction(r: ReportInput): string {
  const critical = r.redFlags.find((f) => f.severity === "CRITICAL");
  if (critical) return `DO NOT PURSUE — ${critical.message}`;

  switch (r.classification) {
    case "PRIORITY":
      return "Prepare the full application package. Requires your explicit APPROVE APPLICATION before anything is submitted.";
    case "STRONG":
      return "Prepare the application package, then review the concerns and missing information below before approving.";
    case "REVIEW":
      return "Saved for your review. Do not invest application effort until you confirm this one is worth pursuing.";
    default:
      return "PASS — recorded but not pursued. Override in the dashboard if you disagree.";
  }
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}
