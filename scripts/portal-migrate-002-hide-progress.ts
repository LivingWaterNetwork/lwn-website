/**
 * Migration 002 — adds portal_persons.hideProgress (nullable-safe, DEFAULT
 * false). Separate from scripts/portal-migrate.ts because that script's
 * STATEMENTS were already applied live on 2026-10-21 — re-running the full
 * batch would fail on the first already-existing CREATE TABLE. See
 * src/lib/portal/migrationStatements.ts's STATEMENTS_002_HIDE_PROGRESS
 * doc comment for why this is its own file rather than appended there.
 *
 * Usage:
 *   npm run portal:migrate:002            # dry run — prints the plan, touches nothing
 *   npm run portal:migrate:002 -- --apply # applies the plan
 */
import { prisma } from "../src/lib/prisma";
import { STATEMENTS_002_HIDE_PROGRESS, assertStatementIsSafe } from "../src/lib/portal/migrationStatements";

async function main() {
  const apply = process.argv.includes("--apply");
  const statements = STATEMENTS_002_HIDE_PROGRESS;

  console.log(`Portal migration 002 (hideProgress) — ${statements.length} statement(s). Mode: ${apply ? "APPLY" : "DRY RUN"}\n`);

  for (const stmt of statements) {
    assertStatementIsSafe(stmt);
    console.log(`  - ${stmt.description}`);
    console.log(`    ${stmt.sql}`);
  }

  if (!apply) {
    console.log(`\nDry run only — nothing was executed. Re-run with --apply to add this column.`);
    return;
  }

  console.log(`\nApplying...`);
  for (const stmt of statements) {
    await prisma.$executeRawUnsafe(stmt.sql);
  }
  console.log(`Done. ${statements.length} statement(s) applied.`);
}

const isMain = process.argv[1] !== undefined && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  main()
    .catch((err) => {
      console.error(err instanceof Error ? err.message : err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
