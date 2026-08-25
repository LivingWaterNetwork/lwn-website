/**
 * Run a discovery pass.
 *
 * Phase 1 behavior: every source whose access policy is not AUTOMATED_ALLOWED
 * produces a manual work item — a list of ready-to-paste queries and how to get
 * results back into the system — rather than an automated fetch. This is not a
 * limitation to route around; it is the design. Sources whose terms forbid
 * automated access do not get automated access.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { PrismaClient } from "@prisma/client";
import { buildConnectors } from "../src/lib/discovery/connectors";
import { parseArray } from "../src/lib/db/json";
import type { RawPosting } from "../src/lib/domain/types";

const prisma = new PrismaClient();

async function readInbox(): Promise<RawPosting[]> {
  const inbox = join(process.cwd(), "inbox");
  try {
    const files = await readdir(inbox);
    const out: RawPosting[] = [];
    for (const f of files.filter((f) => extname(f).toLowerCase() === ".json")) {
      const parsed = JSON.parse(await readFile(join(inbox, f), "utf8")) as unknown;
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of list) {
        const v = item as Record<string, unknown>;
        if (typeof v.title === "string" && typeof v.churchName === "string") out.push(item as RawPosting);
      }
    }
    return out;
  } catch {
    return [];
  }
}

async function main() {
  const prefs = await prisma.searchPreference.findUnique({ where: { id: "default" } });
  const opts = {
    nationwide: prefs?.nationwide ?? true,
    states: parseArray<string>(prefs?.statesJson),
    metros: parseArray<string>(prefs?.metrosJson),
    includeSynonyms: true,
  };

  const connectors = buildConnectors({ readInbox });
  console.log(`Running discovery across ${connectors.length} connector(s).\n`);

  const manualWork: string[] = [];
  let found = 0;

  for (const connector of connectors) {
    const result = await connector.discover(opts);
    found += result.postings.length;
    for (const note of result.notes) console.log(`  [${connector.key}] ${note}`);

    if (result.manualWork) {
      const w = result.manualWork;
      manualWork.push(
        [
          `## ${w.sourceName}`,
          ``,
          `Why manual: ${w.reason}`,
          w.homepage ? `Site: ${w.homepage}` : "",
          ``,
          w.suggestedQueries.length ? "Queries to run:" : "",
          ...w.suggestedQueries.map((q) => `  - ${q}`),
          ``,
          `Getting results back: ${w.howToImport}`,
          ``,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
  }

  console.log(`\n${found} posting(s) available from automated sources.`);

  if (manualWork.length > 0) {
    console.log(`\n${"─".repeat(70)}`);
    console.log("MANUAL REVIEW REQUIRED");
    console.log(`${"─".repeat(70)}\n`);
    console.log(manualWork.join("\n"));
    console.log(
      "These sources restrict automated access. The agent will not scrape them, bypass their\nprotections, or drive an authenticated session on your behalf.",
    );
  }

  console.log("\nNext: run `npm run import` to bring inbox files in, then `npm run score`.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
