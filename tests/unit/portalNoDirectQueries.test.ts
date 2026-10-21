import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";

/**
 * `lib/portal/data/*` is the only code allowed to query portal_* Prisma
 * models — every function there takes the actor and folds the scope into
 * its own `where`. A route or page that queried `prisma.portalX` directly
 * would bypass that scoping entirely. This test fails the moment one does.
 */

const APP_DIR = path.resolve(__dirname, "../../src/app");
const PORTAL_MODEL_RE = /prisma\.portal[A-Z]\w*/;

function listFilesRecursively(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...listFilesRecursively(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

describe("portal data-access isolation", () => {
  it("no file under src/app touches a portal_* Prisma model directly", () => {
    const offenders: string[] = [];
    for (const file of listFilesRecursively(APP_DIR)) {
      const content = readFileSync(file, "utf8");
      if (PORTAL_MODEL_RE.test(content)) {
        offenders.push(path.relative(path.resolve(__dirname, "../.."), file));
      }
    }
    expect(offenders).toEqual([]);
  });
});
