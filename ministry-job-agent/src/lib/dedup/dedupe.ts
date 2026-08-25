import { createHash } from "node:crypto";
import type { RawPosting } from "../domain/types";

/**
 * Duplicate detection.
 *
 * The same opening shows up on ChurchStaffing, Indeed, a denominational board,
 * and the church's own careers page — often with different titles and wildly
 * different description lengths. Those are one opportunity with four sources.
 *
 * Strategy: a deterministic dedupe key for exact-ish matches (cheap, used as a
 * unique index), plus a similarity check for the near-misses the key misses.
 */

const NOISE_WORDS = [
  "full time", "part time", "job", "opening", "position",
  "now hiring", "hiring", "career", "opportunity", "wanted", "needed",
  "job opening", "immediate opening",
];

/** Punctuation is stripped before matching, so hyphenated variants normalize first. */
const NOISE_PHRASES = [...NOISE_WORDS].sort((a, b) => b.length - a.length);

export function normalizeChurchName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(the|inc|incorporated|a|an)\b/g, " ")
    .replace(/\bchurches?\b/g, "church")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeTitle(title: string): string {
  let t = title.toLowerCase().replace(/[^a-z0-9\s&]/g, " ");
  // Longest phrases first, so "now hiring" is removed whole rather than leaving
  // a stray "now" behind after "hiring" matches on its own.
  for (const noise of NOISE_PHRASES) t = t.replace(new RegExp(`\\b${noise}\\b`, "g"), " ");
  return t.replace(/\s+/g, " ").trim();
}

/** Word 3-grams, used to compare descriptions that differ in length and boilerplate. */
export function shingles(text: string, size = 3): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const set = new Set<string>();
  for (let i = 0; i + size <= words.length; i += 1) {
    set.add(words.slice(i, i + size).join(" "));
  }
  return set;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  a.forEach((v) => {
    if (b.has(v)) inter += 1;
  });
  return inter / (a.size + b.size - inter);
}

/**
 * Deterministic key: normalized church + normalized title + state.
 * City is left out on purpose — boards disagree about suburb vs. metro name.
 */
export function dedupeKey(posting: Pick<RawPosting, "churchName" | "title" | "state">): string {
  const basis = [
    normalizeChurchName(posting.churchName),
    normalizeTitle(posting.title),
    (posting.state ?? "").toLowerCase().trim(),
  ].join("|");
  return createHash("sha256").update(basis).digest("hex").slice(0, 32);
}

export interface DuplicateVerdict {
  isDuplicate: boolean;
  confidence: number;
  reason: string;
}

/** Similarity check for postings whose dedupe keys differ but which look like one job. */
export function looksLikeDuplicate(a: RawPosting, b: RawPosting): DuplicateVerdict {
  const sameChurch = normalizeChurchName(a.churchName) === normalizeChurchName(b.churchName);
  if (!sameChurch) {
    return { isDuplicate: false, confidence: 0, reason: "Different churches." };
  }

  const canonicalMatch =
    !!a.canonicalUrl && !!b.canonicalUrl && stripUrl(a.canonicalUrl) === stripUrl(b.canonicalUrl);
  if (canonicalMatch) {
    return { isDuplicate: true, confidence: 1, reason: "Identical canonical job URL." };
  }

  const titleA = normalizeTitle(a.title);
  const titleB = normalizeTitle(b.title);
  const titleSame = titleA === titleB;
  const titleOverlap = jaccard(new Set(titleA.split(" ")), new Set(titleB.split(" ")));

  const descSim = jaccard(shingles(a.descriptionText ?? ""), shingles(b.descriptionText ?? ""));

  if (titleSame && descSim >= 0.2) {
    return { isDuplicate: true, confidence: 0.95, reason: "Same church, same normalized title, overlapping description." };
  }
  if (titleSame && (a.descriptionText ?? "").length < 200) {
    return { isDuplicate: true, confidence: 0.8, reason: "Same church and title; one posting too short to compare text." };
  }
  if (titleOverlap >= 0.5 && descSim >= 0.45) {
    return { isDuplicate: true, confidence: 0.85, reason: "Same church, similar title, strongly overlapping description." };
  }
  if (descSim >= 0.7) {
    return { isDuplicate: true, confidence: 0.8, reason: "Same church with near-identical description text." };
  }

  return {
    isDuplicate: false,
    confidence: Math.max(titleOverlap, descSim),
    reason: "Same church, but the roles read as distinct openings.",
  };
}

/** Prefer the church's own careers page as canonical; job boards rot and paywall. */
export function pickCanonicalUrl(
  sources: Array<{ source: string; url: string }>,
  churchWebsite?: string | null,
): string | null {
  if (sources.length === 0) return null;
  const host = churchWebsite ? safeHost(churchWebsite) : null;
  const onChurchDomain = host ? sources.find((s) => safeHost(s.url) === host) : undefined;
  if (onChurchDomain) return onChurchDomain.url;
  const declaredChurchSite = sources.find((s) => s.source === "church_site");
  if (declaredChurchSite) return declaredChurchSite.url;
  return sources[0]!.url;
}

function stripUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.host.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).host.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}
