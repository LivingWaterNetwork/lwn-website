/**
 * Source file import and conservative claim extraction.
 *
 * The rule this module exists to enforce: importing a document does not make its
 * contents true about the candidate. Every extracted claim lands as
 * UNVERIFIED_IMPORT, quotes the sentence it came from, and stays unusable until
 * Omar approves it in the dashboard.
 *
 * Extraction is deliberately pattern-based rather than model-based. A regex that
 * finds "Founder, Living Water Network" and hands it over for review cannot
 * hallucinate a job that was never in the document.
 */

export interface ExtractedClaimDraft {
  claimText: string;
  suggestedPath: string | null;
  suggestedKind: string | null;
  suggestedValue: string | null;
  /** The sentence the claim came from, so review is verifiable against the source. */
  excerpt: string;
}

interface Extractor {
  kind: string;
  path: string | null;
  pattern: RegExp;
  describe(match: RegExpMatchArray): { claimText: string; value: string };
}

const EXTRACTORS: Extractor[] = [
  {
    kind: "fact",
    path: "contact.email",
    pattern: /\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g,
    describe: (m) => ({ claimText: `Email address: ${m[1]}`, value: m[1]! }),
  },
  {
    kind: "fact",
    path: "contact.phone",
    pattern: /\b(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})\b/g,
    describe: (m) => ({ claimText: `Phone number: ${m[1]}`, value: m[1]! }),
  },
  {
    kind: "link",
    path: null,
    pattern: /\b(https?:\/\/[^\s)<>"']+)/g,
    describe: (m) => ({ claimText: `Link: ${m[1]}`, value: m[1]! }),
  },
  {
    kind: "ministry",
    path: null,
    // "Founder, Living Water Network" / "Executive Director of X"
    pattern: /\b((?:Founder|Co-?Founder|Executive Director|Director|Pastor|Associate Pastor|Lead Pastor|Minister)(?:\s+of)?)[,:]?\s+([A-Z][A-Za-z&'’.\- ]{3,60}?)(?=[.,\n]|$)/g,
    describe: (m) => ({ claimText: `${m[1]!.trim()} — ${m[2]!.trim()}`, value: `${m[1]!.trim()}|${m[2]!.trim()}` }),
  },
  {
    kind: "education",
    path: null,
    pattern: /\b(Bachelor(?:'s)?(?: of [A-Za-z ]+)?|Master(?:'s)?(?: of [A-Za-z ]+)?|M\.?Div|M\.?A\.?|B\.?A\.?|B\.?S\.?|Doctor(?:ate)?|D\.?Min)\b[^.\n]{0,80}/g,
    describe: (m) => ({ claimText: `Possible education credential: ${m[0]!.trim()}`, value: m[0]!.trim() }),
  },
  {
    kind: "ordination",
    path: null,
    pattern: /\b(ordained|ordination|licensed minister|ministerial license)\b[^.\n]{0,80}/gi,
    describe: (m) => ({ claimText: `Possible ordination reference: ${m[0]!.trim()}`, value: m[0]!.trim() }),
  },
  {
    kind: "employment",
    path: null,
    // A date range next to a title is a strong employment signal.
    pattern: /\b((?:19|20)\d{2})\s*[–—-]\s*((?:19|20)\d{2}|present|current)\b/gi,
    describe: (m) => ({ claimText: `Possible date range: ${m[0]!.trim()}`, value: m[0]!.trim() }),
  },
  {
    kind: "metric",
    path: null,
    // Numbers attached to ministry nouns are exactly what must never be inferred.
    pattern: /\b(\d{1,6})\+?\s+(people|students|leaders|volunteers|members|attendees|groups|baptisms|staff)\b/gi,
    describe: (m) => ({
      claimText: `UNVERIFIED METRIC — "${m[0]!.trim()}". Numbers are never used unless you approve them explicitly.`,
      value: m[0]!.trim(),
    }),
  },
];

function sentenceAround(text: string, index: number): string {
  const start = text.lastIndexOf(".", index);
  const end = text.indexOf(".", index);
  const from = start === -1 ? Math.max(0, index - 120) : start + 1;
  const to = end === -1 ? Math.min(text.length, index + 160) : end + 1;
  return text.slice(from, to).replace(/\s+/g, " ").trim();
}

/**
 * Extract candidate claims from plaintext.
 *
 * Returns drafts only. Nothing here writes to the candidate profile, and the
 * caller is expected to persist these as UNVERIFIED_IMPORT.
 */
export function extractClaims(text: string, maxPerKind = 25): ExtractedClaimDraft[] {
  const out: ExtractedClaimDraft[] = [];
  const perKind = new Map<string, number>();
  const seen = new Set<string>();

  for (const ex of EXTRACTORS) {
    const re = new RegExp(ex.pattern.source, ex.pattern.flags.includes("g") ? ex.pattern.flags : `${ex.pattern.flags}g`);
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      const count = perKind.get(ex.kind) ?? 0;
      if (count >= maxPerKind) break;

      const { claimText, value } = ex.describe(match);
      const dedupe = `${ex.kind}:${value}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      perKind.set(ex.kind, count + 1);

      out.push({
        claimText,
        suggestedPath: ex.path,
        suggestedKind: ex.kind,
        suggestedValue: value,
        excerpt: sentenceAround(text, match.index),
      });

      // Guard against a zero-length match spinning forever.
      if (match.index === re.lastIndex) re.lastIndex += 1;
    }
  }

  return out;
}

/** Plaintext extraction per format. PDF/DOCX need optional deps; see docs/importing.md. */
export const SUPPORTED_IMPORT_TYPES = [".txt", ".md", ".csv", ".json", ".pdf", ".docx"] as const;

export function isSupportedImport(filename: string): boolean {
  return SUPPORTED_IMPORT_TYPES.some((ext) => filename.toLowerCase().endsWith(ext));
}
