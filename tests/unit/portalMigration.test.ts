import { describe, expect, it } from "vitest";
import { assertStatementIsSafe, STATEMENTS } from "../../src/lib/portal/migrationStatements";

describe("portal migration safety allowlist", () => {
  it("accepts every statement actually shipped in the migration", () => {
    for (const stmt of STATEMENTS) {
      expect(() => assertStatementIsSafe(stmt)).not.toThrow();
    }
  });

  it("refuses DROP anywhere in a statement", () => {
    expect(() =>
      assertStatementIsSafe({ description: "drop", sql: `DROP TABLE "portal_persons"` })
    ).toThrow(/forbidden keyword/);
  });

  it("refuses TRUNCATE", () => {
    expect(() =>
      assertStatementIsSafe({ description: "truncate", sql: `TRUNCATE "portal_persons"` })
    ).toThrow(/forbidden keyword/);
  });

  it("refuses DELETE as a statement", () => {
    expect(() =>
      assertStatementIsSafe({ description: "delete", sql: `DELETE FROM "portal_persons"` })
    ).toThrow(/forbidden keyword/);
  });

  it("refuses UPDATE as a statement", () => {
    expect(() =>
      assertStatementIsSafe({ description: "update", sql: `UPDATE "portal_persons" SET "email" = 'x'` })
    ).toThrow(/forbidden keyword/);
  });

  it("allows ON DELETE / ON UPDATE referential actions inside a foreign key", () => {
    expect(() =>
      assertStatementIsSafe({
        description: "fk",
        sql: `ALTER TABLE "portal_enrollments" ADD CONSTRAINT "fk" FOREIGN KEY ("agreementId") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
      })
    ).not.toThrow();
  });

  it("refuses RENAME", () => {
    expect(() =>
      assertStatementIsSafe({ description: "rename", sql: `ALTER TABLE "portal_persons" RENAME TO "x"` })
    ).toThrow(/forbidden keyword/);
  });

  it("refuses ALTER TABLE on a table outside the portal_ prefix", () => {
    expect(() =>
      assertStatementIsSafe({
        description: "alter agreements",
        sql: `ALTER TABLE "agreements" ADD CONSTRAINT "x" ADD COLUMN "y" TEXT`,
      })
    ).toThrow();
  });

  it("refuses CREATE TABLE for a table not in CREATED_TABLES", () => {
    expect(() =>
      assertStatementIsSafe({ description: "rogue table", sql: `CREATE TABLE "portal_rogue" ("id" TEXT)` })
    ).toThrow(/not in the declared CREATED_TABLES/);
  });

  it("refuses a statement that is not CREATE TABLE / CREATE INDEX / CREATE TYPE / ALTER ... ADD CONSTRAINT at all", () => {
    expect(() =>
      assertStatementIsSafe({ description: "insert", sql: `INSERT INTO "portal_persons" ("id") VALUES ('x')` })
    ).toThrow(/not a recognized/);
  });

  it("refuses GRANT/REVOKE", () => {
    expect(() =>
      assertStatementIsSafe({ description: "grant", sql: `GRANT ALL ON "portal_persons" TO someuser` })
    ).toThrow(/forbidden keyword/);
  });
});
