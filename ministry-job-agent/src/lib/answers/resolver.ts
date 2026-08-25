import type { AnswerSource, QuestionResolution } from "../domain/enums";
import { detectTheologyTopics } from "../theology/topics";
import { MATCH_THRESHOLD, similarity } from "./normalize";

/**
 * The answer resolver is the one place in the system that decides whether a
 * question can be answered without a human. Everything that fills a form goes
 * through here, so the accuracy rule has exactly one enforcement point.
 *
 * Resolution order, and why:
 *   1. Attestations and legal declarations  -> always human. Signing is not ours.
 *   2. Substantive theological questions    -> approved position, or review queue.
 *   3. Answer bank                          -> only APPROVED + allowAutomaticUse.
 *   4. Candidate facts                      -> only APPROVED facts.
 *   5. Anything else                        -> HUMAN INPUT REQUIRED. Never a guess.
 *
 * There is no branch that composes an answer out of "what seems consistent."
 */

export interface AnswerBankCandidate {
  id: string;
  category: string;
  question: string;
  approvedAnswer: string;
  shortVersion?: string | null;
  mediumVersion?: string | null;
  longVersion?: string | null;
  keywords: string[];
  status: string;
  allowAutomaticUse: boolean;
}

export interface TheologyPositionLike {
  topic: string;
  displayName: string;
  status: string;
  position?: string | null;
  shortForm?: string | null;
  allowAutomaticUse: boolean;
}

export interface CandidateFactLike {
  path: string;
  label: string;
  value: unknown;
  status: string;
}

export interface ResolverContext {
  answerBank: AnswerBankCandidate[];
  theology: TheologyPositionLike[];
  facts: CandidateFactLike[];
}

export interface QuestionInput {
  questionText: string;
  fieldType?: string;
  required?: boolean;
  /** Preferred answer length when the form constrains it. */
  lengthHint?: "short" | "medium" | "long";
}

export interface ResolvedAnswer {
  resolution: QuestionResolution;
  answerText: string | null;
  answerSource: AnswerSource | null;
  answerBankId: string | null;
  autoUsable: boolean;
  /** Human-readable explanation. Shown on the approval screen and the queue. */
  note: string;
  /** For theological questions, the topics involved. */
  theologyTopics: string[];
  matchScore?: number;
}

const ATTESTATION_PATTERNS = [
  /\bi (?:hereby )?(?:certify|attest|affirm|declare|agree)\b/i,
  /\bunder penalty of perjury\b/i,
  /\belectronic signature\b/i,
  /\btype your (?:full )?name (?:below )?to sign\b/i,
  /\bbackground check\b.*\bconsent\b/i,
  /\bi have read and (?:agree|accept)\b/i,
  /\bsign(?:ature)?\b/i,
  /\bstatement of faith\b/i,
  /\bcovenant\b.*\bagree\b/i,
];

function isAttestation(input: QuestionInput): boolean {
  if (input.fieldType === "ATTESTATION") return true;
  return ATTESTATION_PATTERNS.some((p) => p.test(input.questionText));
}

function pickLength(entry: AnswerBankCandidate, hint?: QuestionInput["lengthHint"]): string {
  if (hint === "short" && entry.shortVersion) return entry.shortVersion;
  if (hint === "medium" && entry.mediumVersion) return entry.mediumVersion;
  if (hint === "long" && entry.longVersion) return entry.longVersion;
  return entry.approvedAnswer;
}

/** Candidate-fact questions the system can answer directly from approved data. */
const FACT_QUESTION_MAP: Array<{ pattern: RegExp; path: string }> = [
  { pattern: /\b(full|legal)?\s*name\b/i, path: "identity.full_name" },
  { pattern: /\bemail\b/i, path: "contact.email" },
  { pattern: /\b(phone|mobile|cell)\b/i, path: "contact.phone" },
  { pattern: /\b(city|current location|where do you live)\b/i, path: "location.city" },
  { pattern: /\bstate\b/i, path: "location.state" },
  { pattern: /\b(willing|open) to relocat/i, path: "relocation.open_to_relocation" },
  { pattern: /\blinkedin\b/i, path: "links.linkedin" },
  { pattern: /\bwebsite|personal site\b/i, path: "links.website" },
];

export function resolveQuestion(input: QuestionInput, ctx: ResolverContext): ResolvedAnswer {
  const text = input.questionText.trim();

  // 1. Attestations, signatures, and legal declarations are never automated.
  if (isAttestation(input)) {
    return {
      resolution: "ATTESTATION_REVIEW_REQUIRED",
      answerText: null,
      answerSource: null,
      answerBankId: null,
      autoUsable: false,
      note:
        "This field asks the candidate to sign, certify, or affirm something. Attestations require the candidate's own review and consent — the agent will not complete it.",
      theologyTopics: [],
    };
  }

  // 2. Substantive theological questions.
  const topics = detectTheologyTopics(text);
  if (topics.length > 0) {
    const positions = topics.map((t) => ctx.theology.find((p) => p.topic === t.topic));
    const undefinedTopics = topics.filter((t, i) => {
      const p = positions[i];
      return !p || p.status !== "APPROVED" || !p.position;
    });

    if (undefinedTopics.length > 0) {
      return {
        resolution: "THEOLOGICAL_REVIEW_REQUIRED",
        answerText: null,
        answerSource: null,
        answerBankId: null,
        autoUsable: false,
        note: `THEOLOGICAL REVIEW REQUIRED — no approved position on: ${undefinedTopics
          .map((t) => t.displayName)
          .join(", ")}. The agent does not compose theology from surrounding material.`,
        theologyTopics: topics.map((t) => t.topic),
      };
    }

    const answer = positions
      .map((p) => (input.lengthHint === "short" ? p!.shortForm || p!.position : p!.position))
      .filter(Boolean)
      .join("\n\n");

    const allAuto = positions.every((p) => p!.allowAutomaticUse);
    return {
      resolution: "RESOLVED",
      answerText: answer,
      answerSource: "THEOLOGY",
      answerBankId: null,
      autoUsable: allAuto,
      note: `Answered from approved theology positions: ${topics.map((t) => t.displayName).join(", ")}.`,
      theologyTopics: topics.map((t) => t.topic),
    };
  }

  // 3. Answer bank — approved entries only.
  const usable = ctx.answerBank.filter((e) => e.status === "APPROVED");
  let best: { entry: AnswerBankCandidate; score: number } | null = null;
  for (const entry of usable) {
    let score = similarity(text, entry.question);
    // Keywords nudge a match but cannot manufacture one from nothing.
    const lower = text.toLowerCase();
    const kwHits = entry.keywords.filter((k) => k && lower.includes(k.toLowerCase())).length;
    if (kwHits > 0 && score > 0.25) score = Math.min(1, score + kwHits * 0.08);
    if (!best || score > best.score) best = { entry, score };
  }

  if (best && best.score >= MATCH_THRESHOLD) {
    return {
      resolution: "RESOLVED",
      answerText: pickLength(best.entry, input.lengthHint),
      answerSource: "ANSWER_BANK",
      answerBankId: best.entry.id,
      autoUsable: best.entry.allowAutomaticUse,
      note: `Matched approved answer "${best.entry.question}" (${(best.score * 100).toFixed(0)}% similarity, category: ${best.entry.category}).`,
      theologyTopics: [],
      matchScore: best.score,
    };
  }

  // 4. Direct candidate facts.
  for (const map of FACT_QUESTION_MAP) {
    if (!map.pattern.test(text)) continue;
    const fact = ctx.facts.find((f) => f.path === map.path);
    if (fact && fact.status === "APPROVED" && fact.value != null && fact.value !== "") {
      return {
        resolution: "RESOLVED",
        answerText: String(fact.value),
        answerSource: "CANDIDATE_FACT",
        answerBankId: null,
        autoUsable: true,
        note: `Answered from approved candidate fact "${fact.label}".`,
        theologyTopics: [],
      };
    }
    return {
      resolution: "HUMAN_INPUT_REQUIRED",
      answerText: null,
      answerSource: null,
      answerBankId: null,
      autoUsable: false,
      note: `HUMAN INPUT REQUIRED — "${map.path}" is not an approved candidate fact. Unknown is not permission to infer.`,
      theologyTopics: [],
    };
  }

  // 5. Everything else stops here.
  return {
    resolution: "HUMAN_INPUT_REQUIRED",
    answerText: null,
    answerSource: null,
    answerBankId: null,
    autoUsable: false,
    note: best
      ? `HUMAN INPUT REQUIRED — closest approved answer was "${best.entry.question}" at ${(best.score * 100).toFixed(0)}% similarity, below the ${(MATCH_THRESHOLD * 100).toFixed(0)}% threshold.`
      : "HUMAN INPUT REQUIRED — no approved answer exists for this question.",
    theologyTopics: [],
    matchScore: best?.score,
  };
}
