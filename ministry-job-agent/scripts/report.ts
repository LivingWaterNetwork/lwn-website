/**
 * Generate standardized reports for opportunities scoring 70+, and optionally
 * prepare their application packages.
 *
 * Usage:
 *   npm run report                       # write reports for everything 70+
 *   npm run report -- --prepare          # also build application packages
 *   npm run report -- --id=<id> --prepare
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { renderReport } from "../src/lib/application/report";
import { buildPackage } from "../src/lib/application/package-builder";
import { parseArray, parseJson } from "../src/lib/db/json";
import type { DimensionScore, RedFlag } from "../src/lib/domain/types";

const prisma = new PrismaClient();

const DIRS: Record<string, string> = {
  PRIORITY: "jobs/priority",
  STRONG: "jobs/strong",
  REVIEW: "jobs/review",
  PASS: "jobs/pass",
};

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 70);
}

async function main() {
  const args = process.argv.slice(2);
  const prepare = args.includes("--prepare");
  const idArg = args.find((a) => a.startsWith("--id="))?.split("=")[1];

  const prefs = await prisma.searchPreference.findUnique({ where: { id: "default" } });
  const threshold = prefs?.reportThreshold ?? 70;

  const opportunities = await prisma.opportunity.findMany({
    where: idArg ? { id: idArg } : { score: { gte: threshold } },
    include: {
      church: { include: { facts: true } },
      sources: true,
      packageRecord: { include: { questions: true } },
      humanInputs: { where: { status: "OPEN" } },
      followUps: { where: { status: "DUE" }, orderBy: { dueDate: "asc" }, take: 1 },
    },
    orderBy: { score: "desc" },
  });

  if (opportunities.length === 0) {
    console.log(`Nothing scoring ${threshold}+ yet.`);
    return;
  }

  const approvedCredentials = await prisma.candidateRecord.findMany({
    where: { kind: { in: ["credential", "ordination", "education"] }, status: "APPROVED" },
  });
  const credentialNames = approvedCredentials.map((r) => {
    const p = parseJson<Record<string, unknown>>(r.payload, {});
    return String(p.name ?? p.credential ?? p.type ?? "").trim();
  }).filter(Boolean);

  for (const o of opportunities) {
    if (prepare && !o.church.onHold && !o.onHold) {
      try {
        const built = await buildPackage(prisma, o.id);
        console.log(`  package prepared for ${o.church.name}: ${built.status} (${built.openInputs} open input(s))`);
      } catch (err) {
        console.log(`  package NOT prepared for ${o.church.name}: ${(err as Error).message}`);
      }
    }

    const fresh = await prisma.opportunity.findUniqueOrThrow({
      where: { id: o.id },
      include: { packageRecord: { include: { questions: true } }, humanInputs: { where: { status: "OPEN" } } },
    });

    const portfolio = parseArray<{ name: string; reason: string }>(fresh.packageRecord?.portfolioItemsJson);

    const markdown = renderReport({
      church: o.church.name,
      position: o.title,
      location: [o.city, o.state].filter(Boolean).join(", "),
      sources: o.sources.map((s) => ({ source: s.source, url: s.url, isCanonical: s.isCanonical })),
      canonicalUrl: o.canonicalUrl,
      dateFound: o.discoveredAt,
      postedDate: o.postedDate,
      deadline: o.deadline,
      score: o.score,
      classification: o.classification,
      lane: o.lane,
      dimensions: parseArray<DimensionScore>(o.scoreBreakdownJson),
      redFlags: parseArray<RedFlag>(o.redFlagsJson),
      unknowns: parseArray<string>(o.unknownsJson),
      compensation: { min: o.salaryMin, max: o.salaryMax, note: o.salaryNote },
      benefits: parseArray<string>(o.benefitsJson),
      relocationNote: o.relocationNote,
      housingNote: o.housingNote,
      qualifications: parseArray<string>(o.qualificationsJson),
      approvedCredentials: credentialNames,
      resumeVariant: fresh.packageRecord?.resumeVariant
        ? {
            key: fresh.packageRecord.resumeVariant,
            name: fresh.packageRecord.resumeVariant,
            rationale: fresh.packageRecord.resumeRationale ?? "",
          }
        : null,
      coverLetterAngle: fresh.packageRecord?.coverLetterAngle ?? null,
      portfolio,
      applicationQuestions:
        fresh.packageRecord?.questions.map((q) => ({
          question: q.questionText,
          resolution: q.resolution,
          answer: q.answerText,
        })) ?? [],
      humanInputs: fresh.humanInputs.map((h) => ({ kind: h.kind, question: h.question })),
      status: fresh.status,
      followUpDate: o.followUps[0]?.dueDate ?? null,
      cultureNotes: o.church.facts
        .filter((f) => f.category === "culture" || f.category === "ministry_philosophy")
        .map((f) => ({ claim: f.claim, kind: f.kind, sourceUrl: f.sourceUrl })),
      theologyNotes: o.church.facts
        .filter((f) => f.category === "theology")
        .map((f) => ({ claim: f.claim, sourceUrl: f.sourceUrl })),
      statementOfFaithUrl: o.church.statementOfFaithUrl,
    });

    const dir = join(process.cwd(), DIRS[o.classification ?? "PASS"] ?? "jobs/researched");
    await mkdir(dir, { recursive: true });
    const file = join(dir, `${slug(`${o.church.name}-${o.title}`)}.md`);
    await writeFile(file, markdown, "utf8");
    console.log(`${String(o.score).padStart(3)}/100  ${o.classification}  → ${file.replace(process.cwd() + "/", "")}`);
  }

  console.log(`\n${opportunities.length} report(s) written.`);
  if (prepare) {
    const open = await prisma.humanInputRequest.count({ where: { status: "OPEN" } });
    console.log(`${open} item(s) require human input. Open the dashboard at /queue.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
