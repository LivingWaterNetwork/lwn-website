/**
 * Wraps a YAN Prisma read so a not-yet-migrated database (the new yan_*
 * tables don't exist until `npm run db:push` is run against them) degrades
 * to an empty result instead of a 500 — every /yan route already has a
 * designed "coming soon" / zero-data empty state for exactly this case.
 */
export async function safeYanQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[yan-data] query failed, falling back to empty state:", err);
    return fallback;
  }
}
