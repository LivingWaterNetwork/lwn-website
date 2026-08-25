/**
 * Configurable search query system.
 *
 * Queries are generated from three parts: role terms (title vocabulary),
 * function terms (what the job actually does), and geography. Semantic
 * expansion happens through the synonym table rather than an embedding model,
 * which keeps discovery deterministic and reviewable.
 */

export const ROLE_TERMS = [
  "Young Adults Pastor",
  "Young Adults Director",
  "Young Adult Ministry",
  "College Pastor",
  "College Ministry Pastor",
  "College and Young Adults",
  "Discipleship Pastor",
  "Discipleship Director",
  "Spiritual Formation Pastor",
  "Groups Pastor",
  "Small Groups Pastor",
  "Community Groups Pastor",
  "House Church Pastor",
  "Community Pastor",
  "Connections Pastor",
  "Next Steps Pastor",
  "Engagement Pastor",
  "Assimilation Pastor",
  "Associate Pastor Discipleship",
  "Associate Pastor Groups",
  "Associate Pastor Community",
  "Adult Ministries Pastor",
  "Community Life Pastor",
  "Formation Pastor",
  "Ministries Director",
  "Campus Pastor",
] as const;

/**
 * Function-first queries. These find the role whose title gives nothing away —
 * the "Pastor of Belonging" who actually runs groups, baptism, and assimilation.
 */
export const FUNCTION_TERMS = [
  "discipleship pathway pastor",
  "small group leader development church",
  "spiritual formation ministry church job",
  "volunteer mobilization pastor church",
  "assimilation and baptism pastor",
  "young adult community church staff",
  "leadership development pastor church",
  "adult discipleship ministry position",
] as const;

/** Title synonyms, so a differently-worded posting still surfaces. */
export const SYNONYMS: Record<string, string[]> = {
  pastor: ["minister", "director", "lead", "shepherd"],
  "young adults": ["young adult", "20s and 30s", "twenties thirties", "emerging adults", "post-college"],
  discipleship: ["disciple-making", "spiritual growth", "formation"],
  groups: ["small groups", "life groups", "community groups", "home groups", "missional communities"],
  connections: ["assimilation", "next steps", "guest services", "belonging", "engagement"],
  community: ["community life", "belonging", "relational ministry"],
  college: ["campus", "university", "collegiate"],
};

export interface SearchQuery {
  query: string;
  kind: "role" | "function";
  sourceKey: string;
  geography: string;
}

export interface QueryOptions {
  nationwide: boolean;
  states: string[];
  metros: string[];
  roleTerms?: readonly string[];
  includeFunctionQueries?: boolean;
  includeSynonyms?: boolean;
}

/** Expand a role term across its synonym table. */
export function expandTerm(term: string): string[] {
  const out = new Set<string>([term]);
  const lower = term.toLowerCase();
  for (const [base, alts] of Object.entries(SYNONYMS)) {
    if (!lower.includes(base)) continue;
    for (const alt of alts) {
      out.add(term.replace(new RegExp(base, "i"), alt));
    }
  }
  return Array.from(out);
}

export function buildQueries(sourceKey: string, opts: QueryOptions): SearchQuery[] {
  const geographies = opts.nationwide
    ? ["United States"]
    : [...opts.states, ...opts.metros].filter(Boolean);
  const geos = geographies.length ? geographies : ["United States"];

  const roleTerms = opts.roleTerms ?? ROLE_TERMS;
  const queries: SearchQuery[] = [];

  for (const geography of geos) {
    for (const term of roleTerms) {
      const variants = opts.includeSynonyms ? expandTerm(term) : [term];
      for (const v of variants) {
        queries.push({ query: `${v} church ${geography}`.trim(), kind: "role", sourceKey, geography });
      }
    }
    if (opts.includeFunctionQueries !== false) {
      for (const term of FUNCTION_TERMS) {
        queries.push({ query: `${term} ${geography}`.trim(), kind: "function", sourceKey, geography });
      }
    }
  }

  // Dedupe identical query strings produced by overlapping synonym expansion.
  const seen = new Set<string>();
  return queries.filter((q) => {
    const k = q.query.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
