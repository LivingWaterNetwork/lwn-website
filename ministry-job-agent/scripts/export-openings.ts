/**
 * Export discovered openings and church research to data-seed/openings.json.
 *
 * This file IS committed, unlike the database itself. It holds public
 * job-posting data only — church names, titles, locations, salaries and URLs as
 * published, plus research claims with their source URLs. No candidate
 * information of any kind.
 *
 * The database is gitignored and a cloud session's disk is ephemeral, so
 * without this the discovery work would have to be redone from scratch every
 * time. Run after any import or research pass.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { parseArray } from "../src/lib/db/json";

const prisma = new PrismaClient();

async function main() {
  const churches = await prisma.church.findMany({ include: { facts: true } });
  const opportunities = await prisma.opportunity.findMany({ include: { sources: true, church: true } });

  const seed = {
    note: "Public job-posting data only. No candidate information. Restore with `npm run seed:openings`.",
    exportedAt: new Date().toISOString(),
    churches: churches.map((c) => ({
      slug: c.slug, name: c.name, city: c.city, state: c.state, website: c.website,
      denomination: c.denomination, network: c.network, campusCount: c.campusCount,
      statementOfFaithUrl: c.statementOfFaithUrl, researchStatus: c.researchStatus,
      researchSummary: c.researchSummary, onHold: c.onHold, holdReason: c.holdReason,
      facts: c.facts.map((f) => ({
        category: f.category, claim: f.claim, kind: f.kind,
        sourceUrl: f.sourceUrl, confidence: f.confidence,
      })),
    })),
    opportunities: opportunities.map((o) => ({
      churchSlug: o.church.slug, title: o.title, lane: o.lane,
      city: o.city, state: o.state, employmentType: o.employmentType,
      descriptionText: o.descriptionText,
      responsibilities: parseArray<string>(o.responsibilitiesJson),
      qualifications: parseArray<string>(o.qualificationsJson),
      canonicalUrl: o.canonicalUrl, dedupeKey: o.dedupeKey,
      postedDate: o.postedDate?.toISOString() ?? null,
      deadline: o.deadline?.toISOString() ?? null,
      salaryMin: o.salaryMin, salaryMax: o.salaryMax, salaryNote: o.salaryNote,
      benefits: parseArray<string>(o.benefitsJson),
      housingNote: o.housingNote, relocationNote: o.relocationNote, statusNote: o.statusNote,
      sources: o.sources.map((s) => ({
        source: s.source, url: s.url, isCanonical: s.isCanonical, rawTitle: s.rawTitle,
      })),
    })),
  };

  mkdirSync("data-seed", { recursive: true });
  writeFileSync("data-seed/openings.json", JSON.stringify(seed, null, 1));
  console.log(
    `Exported ${seed.churches.length} churches, ${seed.opportunities.length} opportunities, ` +
      `${seed.churches.reduce((n, c) => n + c.facts.length, 0)} research claims → data-seed/openings.json`,
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
