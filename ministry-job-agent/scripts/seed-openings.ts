/**
 * Restore discovered openings and church research from data-seed/openings.json.
 *
 * Idempotent: churches upsert by slug and opportunities by dedupeKey, so running
 * this over an existing database merges rather than duplicating. Scores are NOT
 * restored — they are derived, and re-deriving them is the point. Run
 * `npm run score -- --all` afterwards.
 *
 * This restores discovery work only. The candidate profile, theology, and answer
 * bank are never exported and never restored from here.
 */
import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Seed {
  churches: Array<Record<string, any>>;
  opportunities: Array<Record<string, any>>;
}

async function main() {
  let raw: string;
  try {
    raw = await readFile("data-seed/openings.json", "utf8");
  } catch {
    console.log("No data-seed/openings.json found. Nothing to restore.");
    return;
  }
  const seed = JSON.parse(raw) as Seed;

  let churchesCreated = 0;
  const idBySlug = new Map<string, string>();

  for (const c of seed.churches) {
    const existing = await prisma.church.findUnique({ where: { slug: c.slug } });
    const church = await prisma.church.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name, city: c.city, state: c.state, website: c.website,
        denomination: c.denomination, network: c.network, campusCount: c.campusCount,
        statementOfFaithUrl: c.statementOfFaithUrl, researchStatus: c.researchStatus,
        researchSummary: c.researchSummary,
        // Never clear a hold that exists locally — a hold is a candidate decision.
        onHold: c.onHold || existing?.onHold || false,
        holdReason: existing?.holdReason ?? c.holdReason,
        researchedAt: c.researchStatus === "RESEARCHED" ? new Date() : null,
      },
      create: {
        slug: c.slug, name: c.name, city: c.city, state: c.state, website: c.website,
        denomination: c.denomination, network: c.network, campusCount: c.campusCount,
        statementOfFaithUrl: c.statementOfFaithUrl, researchStatus: c.researchStatus,
        researchSummary: c.researchSummary, onHold: c.onHold, holdReason: c.holdReason,
        researchedAt: c.researchStatus === "RESEARCHED" ? new Date() : null,
      },
    });
    if (!existing) churchesCreated += 1;
    idBySlug.set(c.slug, church.id);

    for (const f of c.facts ?? []) {
      const dupe = await prisma.churchFact.findFirst({ where: { churchId: church.id, claim: f.claim } });
      if (dupe) continue;
      await prisma.churchFact.create({
        data: {
          churchId: church.id, category: f.category, claim: f.claim,
          kind: f.kind, sourceUrl: f.sourceUrl, confidence: f.confidence,
        },
      });
    }
  }

  let created = 0;
  let merged = 0;
  for (const o of seed.opportunities) {
    const churchId = idBySlug.get(o.churchSlug);
    if (!churchId) { console.log(`  skipped "${o.title}" — church ${o.churchSlug} missing`); continue; }

    const existing = await prisma.opportunity.findUnique({ where: { dedupeKey: o.dedupeKey } });
    const data = {
      churchId, title: o.title, lane: o.lane, city: o.city, state: o.state,
      employmentType: o.employmentType, descriptionText: o.descriptionText,
      responsibilitiesJson: JSON.stringify(o.responsibilities ?? []),
      qualificationsJson: JSON.stringify(o.qualifications ?? []),
      canonicalUrl: o.canonicalUrl,
      postedDate: o.postedDate ? new Date(o.postedDate) : null,
      deadline: o.deadline ? new Date(o.deadline) : null,
      salaryMin: o.salaryMin, salaryMax: o.salaryMax, salaryNote: o.salaryNote,
      benefitsJson: JSON.stringify(o.benefits ?? []),
      housingNote: o.housingNote, relocationNote: o.relocationNote, statusNote: o.statusNote,
    };

    const opp = existing
      ? await prisma.opportunity.update({ where: { id: existing.id }, data })
      : await prisma.opportunity.create({ data: { ...data, dedupeKey: o.dedupeKey, status: "DISCOVERED" } });

    if (existing) merged += 1; else created += 1;

    for (const s of o.sources ?? []) {
      await prisma.opportunitySource.upsert({
        where: { opportunityId_url: { opportunityId: opp.id, url: s.url } },
        update: {},
        create: {
          opportunityId: opp.id, source: s.source, url: s.url,
          isCanonical: s.isCanonical ?? false, rawTitle: s.rawTitle,
        },
      });
    }
  }

  console.log(`Churches: ${churchesCreated} created, ${seed.churches.length - churchesCreated} updated.`);
  console.log(`Opportunities: ${created} created, ${merged} updated.`);
  console.log("\nScores were not restored — they are derived. Run `npm run score -- --all` next.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
