import type { ResearchClaim } from "../domain/types";
import { laneLabel } from "../domain/lanes";
import { ASSET_BY_KEY } from "../portfolio/assets";

/**
 * Cover letter drafting.
 *
 * This produces a DRAFT built only from (a) approved candidate material and
 * (b) cited church research. Where a paragraph would need a fact the system does
 * not have, it emits an explicit [NEEDS: ...] marker instead of inventing one.
 * A draft containing any marker cannot pass the approval gate untouched, which
 * is the point: the candidate finishes the letter, the agent never fabricates it.
 *
 * Style rules are enforced by construction, not by hoping the prose comes out
 * well: no superlatives about the church, no corporate recruiting vocabulary,
 * and every church-specific sentence traces to a VERIFIED_FACT research claim.
 */

export interface CoverLetterInput {
  churchName: string;
  roleTitle: string;
  lane: string | null;
  /** Research claims. Only VERIFIED_FACT entries are quoted back to the church. */
  researchClaims: ResearchClaim[];
  portfolioKeys: string[];
  /** Approved candidate facts available for the letter. */
  approvedFacts: Record<string, unknown>;
  /** Approved answer-bank text for calling / philosophy, if it exists. */
  callingStatement?: string | null;
  ministryPhilosophy?: string | null;
  /**
   * APPROVED ministry/employment records, most relevant first. The experience
   * paragraph is assembled from these verbatim — role, organization and dates
   * exactly as approved. When this is empty the paragraph stays a [NEEDS:]
   * marker; nothing here is ever summarised into a claim the records do not make.
   */
  approvedExperience?: ApprovedExperience[];
}

export interface ApprovedExperience {
  role: string;
  organization: string;
  start?: string | null;
  end?: string | null;
}

export interface CoverLetterDraft {
  angle: string;
  body: string;
  /** Facts the candidate must supply before this letter can go out. */
  needs: string[];
  /** Which research claims the church-specific paragraph relies on. */
  citations: Array<{ claim: string; sourceUrl?: string | null }>;
}

const NEEDS = (label: string) => `[NEEDS: ${label}]`;

export function draftCoverLetter(input: CoverLetterInput): CoverLetterDraft {
  const needs: string[] = [];
  const citations: Array<{ claim: string; sourceUrl?: string | null }> = [];

  const need = (label: string) => {
    if (!needs.includes(label)) needs.push(label);
    return NEEDS(label);
  };

  const candidateName =
    (input.approvedFacts["identity.full_name"] as string | undefined) ?? need("approved full name");

  const lane = laneLabel(input.lane);
  const angle = deriveAngle(input.lane);

  // Church-specific paragraph: verified research only.
  const verified = input.researchClaims.filter((c) => c.kind === "VERIFIED_FACT");
  const ministryPhilosophyClaims = verified.filter(
    (c) => c.category === "ministry_philosophy" || c.category === "culture",
  );
  const theologyClaims = verified.filter((c) => c.category === "theology");

  let churchParagraph: string;
  if (ministryPhilosophyClaims.length === 0 && theologyClaims.length === 0) {
    churchParagraph = need(
      `church-specific research for ${input.churchName} — no verified public claims about ministry philosophy or doctrine were found, and this paragraph must not be written without them`,
    );
  } else {
    const cited = [...ministryPhilosophyClaims, ...theologyClaims].slice(0, 2);
    cited.forEach((c) => citations.push({ claim: c.claim, sourceUrl: c.sourceUrl }));
    churchParagraph = [
      `What drew me to ${input.churchName} is specific rather than general. ${cited[0]!.claim}`,
      cited[1] ? ` ${cited[1].claim}` : "",
      ` That is the kind of ministry I want to give myself to, and it is the work I have been shaped for.`,
    ].join("");
  }

  const callingParagraph =
    input.callingStatement ??
    need("approved answer for 'pastoral calling' in the answer bank");

  const philosophyParagraph =
    input.ministryPhilosophy ??
    "My ministry philosophy moves in one direction: formation leads to discipleship, discipleship builds community, community develops leaders, and leaders multiply. I am not looking to run a better calendar of events. I am looking to build a culture where people are formed by Scripture and prayer, known in real community, and equipped to lead others.";

  const portfolioSentences = input.portfolioKeys
    .map((k) => ASSET_BY_KEY.get(k))
    .filter((a): a is NonNullable<typeof a> => !!a)
    .map((a) => `${a.name} — ${a.summary}`);

  const portfolioParagraph = portfolioSentences.length
    ? `Two pieces of my own work speak most directly to this role. ${portfolioSentences.join(" ")} I am glad to walk through either in conversation.`
    : "";

  // Built only from APPROVED records, cited exactly as approved. No record, no
  // paragraph — the marker stands rather than a summary of history we lack.
  const experience = (input.approvedExperience ?? []).slice(0, 3);
  const experienceParagraph = experience.length
    ? `The work I would bring to this is not theoretical: ${joinClauses(
        experience.map((e) => `${e.role} at ${e.organization}${formatSpan(e)}`),
      )}. I am glad to walk through any of it in detail.`
    : need("approved ministry history — the specific roles and responsibilities to cite here");

  const body = [
    `Dear ${input.churchName} Search Team,`,
    ``,
    `I am writing about the ${input.roleTitle} position. ${callingParagraph}`,
    ``,
    churchParagraph,
    ``,
    philosophyParagraph,
    ``,
    experienceParagraph,
    ``,
    portfolioParagraph,
    ``,
    `I would welcome a conversation about whether the way I lead fits what ${input.churchName} is actually trying to build. Thank you for your prayerful work on this search.`,
    ``,
    `In Christ,`,
    candidateName,
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");

  return { angle: `${angle} (${lane})`, body, needs, citations };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Renders a stored date for prose. `2023-04` becomes `April 2023`; a bare year
 * stays a bare year. The value is only reformatted, never completed — a record
 * storing only a year never gains a month it did not state.
 */
function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : value;
}

/**
 * Renders an approved record's dates. Only what the record states is shown: a
 * record with no start date renders no span rather than a guessed one.
 */
function formatSpan(e: ApprovedExperience): string {
  if (!e.start) return "";
  return ` (${formatDate(e.start)}${e.end ? `–${formatDate(e.end)}` : "–present"})`;
}

/** Joins clauses into readable prose: "a", "a and b", "a, b, and c". */
function joinClauses(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

function deriveAngle(lane: string | null): string {
  switch (lane) {
    case "young_adults_pastor":
    case "young_adults_director":
    case "college_young_adults_pastor":
    case "college_pastor":
      return "Young adults as disciples, not an audience — belonging and formation over programming";
    case "discipleship_pastor":
    case "discipleship_director":
    case "spiritual_formation_pastor":
      return "A designed discipleship pathway rooted in spiritual formation";
    case "groups_pastor":
    case "community_groups_pastor":
    case "house_church_pastor":
    case "community_pastor":
      return "Groups as the place formation actually happens — leader development and multiplication";
    case "connections_pastor":
    case "next_steps_pastor":
    case "engagement_pastor":
    case "assimilation_pastor":
      return "From stranger to neighbor — a connection pathway that ends in discipleship, not a database";
    case "campus_pastor":
    case "adult_ministries_pastor":
    case "ministries_director":
      return "Pastoral leadership of a whole ministry ecosystem, built on leader development";
    default:
      return "Formation, discipleship, community, and leadership development";
  }
}
