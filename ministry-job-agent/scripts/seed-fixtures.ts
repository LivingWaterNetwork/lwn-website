/**
 * FICTIONAL TEST DATA.
 *
 * Every church, posting, and salary in this file is invented for testing the
 * scoring engine, the classification bands, and the approval gates. None of it
 * is real, and none of it touches the candidate profile, the theology database,
 * or the answer bank — those stay exactly as `seed:real` left them.
 *
 * Every fixture church name is prefixed "[TEST]" so it can never be mistaken for
 * a real opportunity in the dashboard, and `npm run db:reset` clears it entirely.
 */
import { PrismaClient } from "@prisma/client";
import { dedupeKey } from "../src/lib/dedup/dedupe";
import { classifyLane } from "../src/lib/domain/lanes";

const prisma = new PrismaClient();

interface Fixture {
  slug: string;
  church: string;
  city: string;
  state: string;
  denomination: string;
  title: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  benefits: string[];
  sources: Array<{ source: string; url: string; canonical?: boolean }>;
  researched: boolean;
  cultureClaims: Array<{ claim: string; kind: "VERIFIED_FACT" | "INFERENCE"; category: string; url?: string }>;
  statementOfFaithUrl?: string;
}

const FIXTURES: Fixture[] = [
  {
    // Designed to land PRIORITY: right lane, deep formation language, real scope,
    // disclosed pay, researched church.
    slug: "test-cedar-ridge",
    church: "[TEST] Cedar Ridge Community Church",
    city: "Franklin",
    state: "TN",
    denomination: "Non-denominational",
    title: "Young Adults Pastor",
    description:
      "Cedar Ridge is seeking a Young Adults Pastor to develop and implement a discipleship pathway for young adults in their twenties and thirties. This is not an events role. We want a pastor who will build a culture of spiritual formation, disciple young adults through Scripture and prayer, develop leaders, and multiply small groups. The Young Adults Pastor reports to the Lead Pastor and holds a seat on the lead team, with authority to develop the strategy for this ministry from the ground up. Responsibilities include teaching regularly, providing pastoral care, and building a team of volunteer leaders.",
    responsibilities: [
      "Develop and implement the discipleship pathway for young adults",
      "Build a team of volunteer leaders and develop leaders for multiplication",
      "Teach regularly in the young adults gathering",
      "Provide pastoral care to young adults and group leaders",
      "Own the budget for young adults ministry",
      "Recruit, train, and shepherd small groups leaders",
    ],
    qualifications: [
      "Demonstrated experience in young adult or college ministry",
      "Commitment to spiritual formation and disciple-making",
      "Bachelor's degree required",
    ],
    salaryMin: 68000,
    salaryMax: 82000,
    benefits: ["health insurance", "retirement", "PTO", "professional development"],
    sources: [
      { source: "church_site", url: "https://example-cedarridge.test/careers/young-adults-pastor", canonical: true },
      { source: "churchstaffing", url: "https://churchstaffing.test/jobs/12345" },
    ],
    researched: true,
    statementOfFaithUrl: "https://example-cedarridge.test/beliefs",
    cultureClaims: [
      { claim: "The church publishes an elder board roster and annual financial summary.", kind: "VERIFIED_FACT", category: "culture", url: "https://example-cedarridge.test/leadership" },
      { claim: "Stated values name discipleship, community, and leadership development.", kind: "VERIFIED_FACT", category: "ministry_philosophy", url: "https://example-cedarridge.test/values" },
      { claim: "Staff page describes a team development and leader care rhythm.", kind: "VERIFIED_FACT", category: "culture", url: "https://example-cedarridge.test/staff" },
      { claim: "Statement of faith affirms the authority of Scripture and the Trinity.", kind: "VERIFIED_FACT", category: "theology", url: "https://example-cedarridge.test/beliefs" },
    ],
  },
  {
    // Designed to land STRONG: good lane and scope, compensation undisclosed.
    slug: "test-northpoint-fellowship",
    church: "[TEST] Northpoint Fellowship",
    city: "Columbus",
    state: "OH",
    denomination: "Evangelical Free",
    title: "Next Steps Pastor",
    description:
      "Northpoint Fellowship is hiring a Next Steps Pastor to own our discipleship pathway from first-time guest through baptism, membership class, and small groups. This role carries responsibility for assimilation, volunteer mobilization, and leadership development. The Next Steps Pastor will develop and implement the connection process, supervise two part-time staff, and reports directly to the Executive Pastor. Teaching opportunities are available.",
    responsibilities: [
      "Own the discipleship pathway from guest to group member",
      "Lead assimilation, baptism, and membership class processes",
      "Recruit and develop volunteer leaders",
      "Supervise the connections team",
      "Develop and implement the connection process",
    ],
    qualifications: ["Ministry experience required", "Bachelor's degree preferred"],
    salaryMin: null,
    salaryMax: null,
    benefits: [],
    sources: [{ source: "ministryjobs", url: "https://ministryjobs.test/jobs/np-next-steps" }],
    researched: true,
    statementOfFaithUrl: "https://example-northpoint.test/what-we-believe",
    cultureClaims: [
      { claim: "Church website states a commitment to leadership development and team health.", kind: "VERIFIED_FACT", category: "culture", url: "https://example-northpoint.test/about" },
      { claim: "Statement of faith affirms salvation by grace and the Great Commission.", kind: "VERIFIED_FACT", category: "theology", url: "https://example-northpoint.test/what-we-believe" },
    ],
  },
  {
    // Designed to trip the pastoral-title/admin-role red flag AND a credential gap.
    slug: "test-grace-chapel",
    church: "[TEST] Grace Chapel of the Plains",
    city: "Wichita",
    state: "KS",
    denomination: "Baptist",
    title: "Discipleship Pastor",
    description:
      "Full-time Discipleship Pastor. Primary duties include office management, calendar management, scheduling meetings, data entry into our church management system, and administrative support for the pastoral staff. Candidate must be ordained and hold a Master of Divinity. Candidate must affirm our complementarian position on gender roles and sign our statement of faith.",
    responsibilities: [
      "Office management and administrative support",
      "Calendar management and scheduling meetings",
      "Data entry and database maintenance",
    ],
    qualifications: ["Ordained", "Master of Divinity required", "Affirm complementarian position"],
    salaryMin: 34000,
    salaryMax: 38000,
    benefits: ["health insurance"],
    sources: [{ source: "christianjobs", url: "https://christianjobs.test/jobs/grace-disc" }],
    researched: true,
    cultureClaims: [
      { claim: "Church publishes a doctrinal statement.", kind: "VERIFIED_FACT", category: "theology", url: "https://example-gracechapel.test/beliefs" },
      { claim: "Job description is unclear about who this role reports to.", kind: "INFERENCE", category: "culture" },
    ],
  },
  {
    // Designed to land REVIEW: relevant lane, thin posting, no research.
    slug: "test-riverstone",
    church: "[TEST] Riverstone Church",
    city: "Boise",
    state: "ID",
    denomination: "Non-denominational",
    title: "Groups Pastor",
    description:
      "Riverstone Church is looking for a Groups Pastor to lead our small groups ministry. Contact us for details.",
    responsibilities: ["Lead small groups ministry"],
    qualifications: [],
    salaryMin: null,
    salaryMax: null,
    benefits: [],
    sources: [{ source: "manual", url: "https://example-riverstone.test/jobs/groups" }],
    researched: false,
    cultureClaims: [],
  },
  {
    // Duplicate of Cedar Ridge under a different source and a noisier title.
    // Proves the dedupe path: this should attach as a source, not create a row.
    slug: "test-cedar-ridge",
    church: "[TEST] Cedar Ridge Community Church",
    city: "Franklin",
    state: "TN",
    denomination: "Non-denominational",
    title: "Young Adults Pastor - Full Time",
    description:
      "Cedar Ridge is seeking a Young Adults Pastor to develop and implement a discipleship pathway for young adults in their twenties and thirties. This is not an events role.",
    responsibilities: [],
    qualifications: [],
    salaryMin: 68000,
    salaryMax: 82000,
    benefits: [],
    sources: [{ source: "indeed", url: "https://indeed.test/viewjob?jk=abc123" }],
    researched: true,
    cultureClaims: [],
  },
];

async function main() {
  console.log("Seeding FICTIONAL TEST DATA (churches prefixed [TEST])…\n");

  for (const f of FIXTURES) {
    const church = await prisma.church.upsert({
      where: { slug: f.slug },
      update: {},
      create: {
        slug: f.slug,
        name: f.church,
        city: f.city,
        state: f.state,
        denomination: f.denomination,
        statementOfFaithUrl: f.statementOfFaithUrl ?? null,
        researchStatus: f.researched ? "RESEARCHED" : "NOT_RESEARCHED",
        researchedAt: f.researched ? new Date() : null,
        researchSummary: f.researched ? "FICTIONAL TEST DATA — research fixture." : null,
      },
    });

    for (const c of f.cultureClaims) {
      const exists = await prisma.churchFact.findFirst({ where: { churchId: church.id, claim: c.claim } });
      if (exists) continue;
      await prisma.churchFact.create({
        data: {
          churchId: church.id,
          category: c.category,
          claim: c.claim,
          kind: c.kind,
          sourceUrl: c.url ?? null,
          confidence: c.kind === "VERIFIED_FACT" ? "HIGH" : "LOW",
        },
      });
    }

    const key = dedupeKey({ churchName: f.church, title: f.title, state: f.state });
    const lane = classifyLane(f.title, `${f.description} ${f.responsibilities.join(" ")}`);

    const existing = await prisma.opportunity.findUnique({
      where: { dedupeKey: key },
      include: { sources: true },
    });

    if (existing) {
      // Duplicate: attach the new source rather than creating a second row.
      for (const s of f.sources) {
        await prisma.opportunitySource.upsert({
          where: { opportunityId_url: { opportunityId: existing.id, url: s.url } },
          update: {},
          create: { opportunityId: existing.id, source: s.source, url: s.url, rawTitle: f.title },
        });
      }
      console.log(`  dedup: "${f.title}" merged into existing opportunity for ${f.church}`);
      continue;
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        churchId: church.id,
        title: f.title,
        lane: lane?.lane.key ?? null,
        city: f.city,
        state: f.state,
        employmentType: "FULL_TIME",
        descriptionText: f.description,
        responsibilitiesJson: JSON.stringify(f.responsibilities),
        qualificationsJson: JSON.stringify(f.qualifications),
        canonicalUrl: f.sources.find((s) => s.canonical)?.url ?? f.sources[0]?.url ?? null,
        dedupeKey: key,
        salaryMin: f.salaryMin,
        salaryMax: f.salaryMax,
        benefitsJson: JSON.stringify(f.benefits),
        status: "DISCOVERED",
        statusNote: "FICTIONAL TEST DATA",
      },
    });

    for (const s of f.sources) {
      await prisma.opportunitySource.create({
        data: {
          opportunityId: opportunity.id,
          source: s.source,
          url: s.url,
          isCanonical: s.canonical ?? false,
          rawTitle: f.title,
        },
      });
    }

    await prisma.statusEvent.create({
      data: { opportunityId: opportunity.id, toStatus: "DISCOVERED", note: "Seeded fixture." },
    });

    console.log(`  created: ${f.church} — ${f.title} (lane: ${lane?.lane.key ?? "none"})`);
  }

  const count = await prisma.opportunity.count();
  console.log(`\nDone. ${count} opportunities in the database. Run \`npm run score\` to score them.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
