import { THEOLOGY_TOPICS, type TheologyTopic } from "./topics";
import { REFERENCE_STATEMENTS, type ReferenceArticle } from "./references";

/**
 * Convergence analysis across reference statements of faith.
 *
 * The candidate named several churches whose theology he says aligns with his.
 * Those churches do not agree with each other on every point, and the places
 * they diverge are exactly the places a pastoral search committee probes. This
 * module makes that visible rather than letting it be discovered in an interview.
 *
 * Nothing here decides what the candidate believes. It reports what the sources
 * say, where they conflict, and where they are all silent.
 */

export type ConvergenceLevel =
  /** Multiple sources speak to this and none contradict. Fast to confirm. */
  | "CONVERGENT"
  /** Sources speak to this but stake out materially different positions. Read both. */
  | "DIVERGENT"
  /** Exactly one source addresses it. Thin support — his call. */
  | "SINGLE_SOURCE"
  /** No reference addresses this. He writes it from scratch. */
  | "UNADDRESSED";

export interface TopicCoverage {
  topic: TheologyTopic;
  level: ConvergenceLevel;
  articles: Array<{
    sourceKey: string;
    organization: string;
    url: string;
    heading: string;
    text: string;
  }>;
  /** Plain-language explanation shown in the UI. */
  note: string;
  /** Set when sources conflict: what specifically differs. */
  conflict?: string;
}

/**
 * Known doctrinal fault lines among the reference sources.
 *
 * These are hand-identified rather than inferred: detecting a real doctrinal
 * disagreement from text similarity is not something to guess at, and a false
 * "these agree" is worse than no analysis at all.
 */
const KNOWN_CONFLICTS: Record<string, string> = {
  charismatic_theology:
    "CfaN states tongues as the evidence of Spirit baptism (classical Pentecostal initial-evidence doctrine). Victory affirms Spirit baptism without stating initial evidence. Change Church and 2819 do not address it. These are materially different positions, and churches ask about this directly.",
  spiritual_gifts:
    "CfaN ties the gifts to Spirit baptism with tongues as evidence. 2819 describes the Spirit distributing gifts without charismatic distinctives. A cessationist or soft-continuationist church will press on the difference.",
  eschatology:
    "CfaN affirms the rapture of the Church (dispensational 'blessed hope' language). 2819 and Change affirm a visible second coming without specifying a rapture. Reformed and amillennial churches will notice which language you use.",
};

/** Topics that pastoral applications ask about most often. Surfaced first. */
export const HIGH_PRIORITY_TOPICS = [
  "scripture",
  "salvation",
  "gospel",
  "jesus_christ",
  "holy_spirit",
  "baptism",
  "spiritual_gifts",
  "charismatic_theology",
  "women_in_ministry",
  "sexuality",
  "church_governance",
  "eschatology",
];

export function analyzeCoverage(): TopicCoverage[] {
  return THEOLOGY_TOPICS.map((topic) => {
    const articles: TopicCoverage["articles"] = [];

    for (const statement of REFERENCE_STATEMENTS) {
      for (const article of statement.articles) {
        if (!article.topics.includes(topic.topic)) continue;
        articles.push({
          sourceKey: statement.key,
          organization: statement.organization,
          url: statement.url,
          heading: article.heading,
          text: article.text,
        });
      }
    }

    const sourceCount = new Set(articles.map((a) => a.sourceKey)).size;
    const conflict = KNOWN_CONFLICTS[topic.topic];

    let level: ConvergenceLevel;
    let note: string;

    if (articles.length === 0) {
      level = "UNADDRESSED";
      note =
        "None of your reference statements address this. You will need to write this one yourself — and if it is on the high-priority list, expect to be asked.";
    } else if (conflict) {
      level = "DIVERGENT";
      note = "Your reference sources take materially different positions here. Read both before deciding.";
    } else if (sourceCount === 1) {
      level = "SINGLE_SOURCE";
      note = `Only ${articles[0]!.organization} addresses this. Thin support — confirm it is genuinely your position, not just the one you happened to read.`;
    } else {
      level = "CONVERGENT";
      note = `${sourceCount} of your reference sources agree in substance. Quick to confirm, but the wording should still be yours.`;
    }

    return { topic, level, articles, note, conflict };
  });
}

export interface CoverageSummary {
  convergent: number;
  divergent: number;
  singleSource: number;
  unaddressed: number;
  /** High-priority topics with no reference coverage at all. */
  criticalGaps: string[];
}

export function summarizeCoverage(coverage: TopicCoverage[]): CoverageSummary {
  const count = (level: ConvergenceLevel) => coverage.filter((c) => c.level === level).length;

  const criticalGaps = coverage
    .filter((c) => c.level === "UNADDRESSED" && HIGH_PRIORITY_TOPICS.includes(c.topic.topic))
    .map((c) => c.topic.displayName);

  return {
    convergent: count("CONVERGENT"),
    divergent: count("DIVERGENT"),
    singleSource: count("SINGLE_SOURCE"),
    unaddressed: count("UNADDRESSED"),
    criticalGaps,
  };
}

/** Order topics so the ones blocking applications come first. */
export function prioritize(coverage: TopicCoverage[]): TopicCoverage[] {
  const rank = (c: TopicCoverage) => {
    const high = HIGH_PRIORITY_TOPICS.includes(c.topic.topic) ? 0 : 1;
    const byLevel = { DIVERGENT: 0, UNADDRESSED: 1, CONVERGENT: 2, SINGLE_SOURCE: 3 }[c.level];
    return high * 10 + byLevel;
  };
  return [...coverage].sort((a, b) => rank(a) - rank(b));
}
