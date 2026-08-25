import type { RawPosting } from "../domain/types";
import { EMPLOYMENT_TYPES, type EmploymentType } from "../domain/enums";

/**
 * Coercion at the JSON boundary.
 *
 * A posting read from a .json file is `unknown` no matter what the TypeScript
 * type says: dates arrive as strings, numbers arrive as strings, and the
 * compiler cannot see any of it. Everything crossing that boundary goes through
 * here first.
 *
 * The rule is the same one that governs the rest of the system: a value that
 * cannot be trusted becomes null rather than a guess. An unparseable date is
 * not silently coerced to today.
 */

/** Parse a date from a JSON value. Returns null for anything unparseable. */
export function coerceDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string" && typeof value !== "number") return null;

  // A bare "2026-06-04" parses as UTC midnight, which is what we want for a
  // posted date — no timezone shifting a date backward by a day.
  const parsed = new Date(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Parse an integer, tolerating "$70,000" and "70000". Null when not a number. */
export function coerceInt(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? Math.round(value) : null;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[$,\s]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned));
}

export function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0).map((v) => v.trim());
}

function coerceEmploymentType(value: unknown): EmploymentType {
  if (typeof value !== "string") return "UNKNOWN";
  const upper = value.toUpperCase().replace(/[\s-]/g, "_") as EmploymentType;
  return EMPLOYMENT_TYPES.includes(upper) ? upper : "UNKNOWN";
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Validate and coerce a parsed JSON value into a RawPosting.
 * Returns null when the two genuinely required fields are missing — a posting
 * without a church and a title is not a posting.
 */
export function coercePosting(value: unknown): RawPosting | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;

  const title = str(v.title);
  const churchName = str(v.churchName);
  if (!title || !churchName) return null;

  return {
    source: str(v.source) ?? "manual",
    sourceUrl: str(v.sourceUrl) ?? "",
    title,
    churchName,
    city: str(v.city),
    state: str(v.state),
    descriptionText: str(v.descriptionText),
    canonicalUrl: str(v.canonicalUrl),
    postedDate: coerceDate(v.postedDate),
    deadline: coerceDate(v.deadline),
    employmentType: coerceEmploymentType(v.employmentType),
    salaryMin: coerceInt(v.salaryMin),
    salaryMax: coerceInt(v.salaryMax),
    salaryNote: str(v.salaryNote),
    responsibilities: coerceStringArray(v.responsibilities),
    qualifications: coerceStringArray(v.qualifications),
    benefits: coerceStringArray(v.benefits),
  };
}
