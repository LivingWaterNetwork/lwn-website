/**
 * Question normalization and matching.
 *
 * Matching is deliberately conservative. A false positive here means an
 * application goes out carrying an answer to a question nobody actually asked,
 * so the threshold is high and near-misses fall through to human input.
 */

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "do", "does", "did", "you", "your", "yours",
  "please", "describe", "tell", "us", "about", "what", "how", "why", "in", "of",
  "to", "for", "and", "or", "with", "on", "at", "would", "will", "can", "could",
  "have", "has", "any", "this", "that", "it", "be", "as", "if", "we",
]);

export function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(q: string): string[] {
  return normalizeQuestion(q)
    .split(" ")
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

/** Jaccard similarity over content tokens. 1 = identical content words. */
export function similarity(a: string, b: string): number {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let intersection = 0;
  ta.forEach((t) => {
    if (tb.has(t)) intersection += 1;
  });
  const union = ta.size + tb.size - intersection;
  return intersection / union;
}

/** Below this, an answer-bank entry is not considered a match at all. */
export const MATCH_THRESHOLD = 0.62;
