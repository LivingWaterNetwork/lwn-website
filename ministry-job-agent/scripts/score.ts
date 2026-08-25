/**
 * Score (or re-score) opportunities.
 *
 * Usage:
 *   npm run score              # score everything not yet scored
 *   npm run score -- --all     # re-score everything
 *   npm run score -- --id=xxx  # score one opportunity
 */
import { PrismaClient } from "@prisma/client";
import { scoreAndPersist } from "../src/lib/scoring/service";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes("--all");
  const idArg = args.find((a) => a.startsWith("--id="))?.split("=")[1];

  const where = idArg ? { id: idArg } : all ? {} : { scoredAt: null };
  const opportunities = await prisma.opportunity.findMany({
    where,
    include: { church: true },
    orderBy: { discoveredAt: "desc" },
  });

  if (opportunities.length === 0) {
    console.log("Nothing to score.");
    return;
  }

  console.log(`Scoring ${opportunities.length} opportunit${opportunities.length === 1 ? "y" : "ies"}…\n`);

  for (const opp of opportunities) {
    const result = await scoreAndPersist(prisma, opp.id);
    const override =
      result.classification !== result.rawClassification
        ? `  (red-flag override from ${result.rawClassification})`
        : "";
    const ceiling =
      result.researchRecommended || (result.provisional && result.ceiling > result.score)
        ? `  (ceiling ${result.ceiling})`
        : "";
    console.log(
      `${String(result.score).padStart(3)}/100  ${result.classification.padEnd(8)} ${opp.church.name} — ${opp.title}${override}${ceiling}`,
    );
    if (result.researchRecommended) {
      console.log(`         → RESEARCH THIS: could reach ${result.ceiling} once the church is researched.`);
    }
    for (const f of result.redFlags) {
      console.log(`         ⚑ ${f.severity}: ${f.message}`);
    }
    if (result.unknowns.length) {
      console.log(`         ? ${result.unknowns.length} unknown(s) recorded`);
    }
  }

  const counts = await prisma.opportunity.groupBy({ by: ["classification"], _count: true });
  console.log("\nPipeline:");
  for (const c of counts) console.log(`  ${c.classification ?? "unscored"}: ${c._count}`);

  const toResearch = await prisma.opportunity.count({ where: { researchRecommended: true } });
  if (toResearch > 0) {
    console.log(
      `\n${toResearch} opportunit${toResearch === 1 ? "y is" : "ies are"} held below the bar only by missing church research.`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
