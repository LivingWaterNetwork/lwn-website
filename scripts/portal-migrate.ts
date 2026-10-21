/**
 * Additive-only migration runner for the Member Portal's portal_* tables.
 *
 * This repo otherwise uses `prisma db push` for schema sync (see AGENTS.md),
 * but the portal's hard rule is: never run `prisma db push` / `migrate dev` /
 * `migrate reset` against this shared Preview+Production database for this
 * feature. Instead, every portal_* table is created by the hand-written,
 * safety-checked statements in src/lib/portal/migrationStatements.ts.
 *
 * What this script will run, and nothing else:
 *   - CREATE TABLE for a portal_* table
 *   - CREATE INDEX / CREATE UNIQUE INDEX on a portal_* table
 *   - CREATE TYPE portal_*
 *   - ALTER TABLE <portal_* table created by this file> ADD CONSTRAINT
 *     (used only for the two foreign keys into the existing, untouched
 *     `agreements` / `agreement_documents` tables)
 *
 * Every statement is pattern-checked against an allowlist before it can run,
 * and the script refuses to start if ANY statement contains DROP, TRUNCATE,
 * UPDATE, DELETE, or RENAME, or touches a table outside the portal_* set
 * this same file creates. This is defense in depth on top of the fact that
 * the statements are hand-written — the existing `agreements`,
 * `agreement_documents`, and every other table in this database are never
 * altered.
 *
 * Usage:
 *   npm run portal:migrate            # dry run — prints the plan, touches nothing
 *   npm run portal:migrate -- --apply # applies the plan inside one transaction
 */
import { prisma } from "../src/lib/prisma";
import { STATEMENTS, assertStatementIsSafe } from "../src/lib/portal/migrationStatements";

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(`Portal migration — ${STATEMENTS.length} statement(s). Mode: ${apply ? "APPLY" : "DRY RUN"}\n`);

  for (const stmt of STATEMENTS) {
    assertStatementIsSafe(stmt);
    console.log(`  - ${stmt.description}`);
  }

  console.log(
    `\nAll ${STATEMENTS.length} statements passed the allowlist check (CREATE TABLE / CREATE INDEX / CREATE TYPE / ` +
      `ALTER TABLE ... ADD CONSTRAINT, all on portal_* tables this file creates).`
  );
  console.log(
    `Note: the two foreign keys assume "agreements"."id" and "agreement_documents"."id" are TEXT columns (Prisma's ` +
      `default mapping for String @default(uuid()/cuid()) without @db.Uuid). Confirmed 2026-10-21 against the live ` +
      `shared Preview+Production database (information_schema.columns reports both as "text") — see PR #18. ` +
      `No existing table is read, altered, or otherwise touched by this script either way.`
  );

  if (!apply) {
    console.log(`\nDry run only — nothing was executed. Re-run with --apply to create these tables.`);
    return;
  }

  console.log(`\nApplying inside a single transaction...`);
  await prisma.$transaction(async (tx) => {
    for (const stmt of STATEMENTS) {
      await tx.$executeRawUnsafe(stmt.sql);
    }
  });
  console.log(`Done. ${STATEMENTS.length} statements applied.`);
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
