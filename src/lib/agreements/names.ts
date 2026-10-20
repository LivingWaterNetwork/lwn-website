/** Normalizes a name for comparison: case- and whitespace-insensitive. */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function namesMatch(a: string, b: string): boolean {
  return normalizeName(a) === normalizeName(b);
}

/**
 * Derives initials from a full name for display next to an "I initial this
 * section" control — e.g. "Amaya Frias" -> "AF". Used consistently in the
 * signer UI, the PDF signature page, and the audit log event detail, so the
 * same mark means the same thing everywhere.
 */
export function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
