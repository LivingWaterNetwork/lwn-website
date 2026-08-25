/**
 * SQLite has no JSON column type, so structured fields are stored as TEXT.
 * These helpers keep the parse/stringify in one place and never throw on bad
 * data — a corrupt cell degrades to the fallback rather than crashing a page.
 */

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (value == null || value === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function parseArray<T>(value: string | null | undefined): T[] {
  const parsed = parseJson<unknown>(value, []);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}
