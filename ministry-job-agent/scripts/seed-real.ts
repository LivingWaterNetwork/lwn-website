/**
 * Seeds the REAL database with STRUCTURE ONLY.
 *
 * This script creates the shape of the candidate profile, the theology topic
 * list, the answer-bank question list, resume variant slots, and portfolio
 * entries — every one of them empty and unapproved.
 *
 * It writes no candidate facts and no theological positions. That is deliberate
 * and permanent: the only way a fact or a position becomes usable is for Omar to
 * enter and approve it. Running this repeatedly is safe; it never overwrites an
 * APPROVED value.
 */
import { PrismaClient } from "@prisma/client";
import { CANDIDATE_FACTS } from "../src/lib/candidate/schema";
import { THEOLOGY_TOPICS } from "../src/lib/theology/topics";
import { ANSWER_CATEGORIES } from "../src/lib/answers/categories";
import { RESUME_VARIANTS } from "../src/lib/resumes/variants";
import { PORTFOLIO_ASSETS } from "../src/lib/portfolio/assets";
import { normalizeQuestion } from "../src/lib/answers/normalize";
import { ROLE_TERMS } from "../src/lib/discovery/search-terms";

const prisma = new PrismaClient();

/** Churches the candidate has placed on hold. Recorded, never pursued. */
const HOLD_CHURCHES = [
  {
    slug: "rock-harbor-church",
    name: "Rock Harbor Church",
    holdReason: "HOLD — DO NOT APPLY. Placed on hold by the candidate. Remove the hold to pursue.",
  },
  {
    slug: "bay-area-church-opportunity",
    name: "Bay Area church opportunity (previously identified)",
    holdReason:
      "HOLD — DO NOT APPLY. Previously identified Bay Area opportunity, on hold by the candidate. Church identity NOT PROVIDED; update this record when the candidate supplies it.",
  },
];

async function main() {
  console.log("Seeding structure (no candidate facts, no theology positions)…\n");

  // 1. Candidate fact slots — all NOT_PROVIDED.
  let factsCreated = 0;
  for (const spec of CANDIDATE_FACTS) {
    const existing = await prisma.candidateFact.findUnique({ where: { path: spec.path } });
    if (existing) continue;
    await prisma.candidateFact.create({
      data: {
        path: spec.path,
        category: spec.category,
        label: spec.label,
        valueJson: null,
        status: "NOT_PROVIDED",
        sensitive: spec.sensitive ?? false,
        notes: spec.prompt ?? null,
      },
    });
    factsCreated += 1;
  }
  console.log(`  candidate fact slots: ${factsCreated} created, all NOT_PROVIDED`);

  // 2. Theology topics — all NOT_YET_DEFINED.
  let topicsCreated = 0;
  for (const t of THEOLOGY_TOPICS) {
    const existing = await prisma.theologyPosition.findUnique({ where: { topic: t.topic } });
    if (existing) continue;
    await prisma.theologyPosition.create({
      data: {
        topic: t.topic,
        displayName: t.displayName,
        status: "NOT_YET_DEFINED",
        position: null,
        allowAutomaticUse: false,
      },
    });
    topicsCreated += 1;
  }
  console.log(`  theology topics: ${topicsCreated} created, all NOT_YET_DEFINED`);

  // 3. Answer-bank questions — seeded as DRAFT with NO answer text.
  let answersCreated = 0;
  for (const cat of ANSWER_CATEGORIES) {
    for (const question of cat.questions) {
      const normalized = normalizeQuestion(question);
      const existing = await prisma.answerBankEntry.findFirst({
        where: { normalizedQuestion: normalized, category: cat.key },
      });
      if (existing) continue;
      await prisma.answerBankEntry.create({
        data: {
          category: cat.key,
          question,
          normalizedQuestion: normalized,
          approvedAnswer: "",
          keywordsJson: JSON.stringify(cat.keywords),
          status: "DRAFT",
          allowAutomaticUse: false,
        },
      });
      answersCreated += 1;
    }
  }
  console.log(`  answer-bank questions: ${answersCreated} created, all DRAFT with empty answers`);

  // 4. Resume variant slots — NOT_PROVIDED until Omar supplies the files.
  for (const v of RESUME_VARIANTS) {
    await prisma.resumeVariant.upsert({
      where: { key: v.key },
      update: { name: v.name, focus: v.focus, sourcePath: v.sourcePath, atsPath: v.atsPath, lanesJson: JSON.stringify(v.lanes) },
      create: {
        key: v.key,
        name: v.name,
        focus: v.focus,
        sourcePath: v.sourcePath,
        atsPath: v.atsPath,
        lanesJson: JSON.stringify(v.lanes),
        status: "NOT_PROVIDED",
      },
    });
  }
  console.log(`  resume variants: ${RESUME_VARIANTS.length} slots, all NOT_PROVIDED`);

  // 5. Portfolio assets — summaries only, no scale claims.
  for (const a of PORTFOLIO_ASSETS) {
    await prisma.portfolioAsset.upsert({
      where: { key: a.key },
      update: { name: a.name, summary: a.summary, detail: a.detail, bestForJson: JSON.stringify(a.bestFor), filePath: a.directory },
      create: {
        key: a.key,
        name: a.name,
        summary: a.summary,
        detail: a.detail,
        bestForJson: JSON.stringify(a.bestFor),
        filePath: a.directory,
        status: "SUMMARY_ONLY",
      },
    });
  }
  console.log(`  portfolio assets: ${PORTFOLIO_ASSETS.length} registered`);

  // 6. HOLD churches.
  for (const c of HOLD_CHURCHES) {
    await prisma.church.upsert({
      where: { slug: c.slug },
      update: { onHold: true, holdReason: c.holdReason },
      create: { slug: c.slug, name: c.name, onHold: true, holdReason: c.holdReason },
    });
  }
  console.log(`  hold list: ${HOLD_CHURCHES.length} churches marked HOLD — DO NOT APPLY`);

  // 7. Search preferences — the documented defaults.
  await prisma.searchPreference.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      nationwide: true,
      relocationOpen: true,
      churchTypesJson: JSON.stringify(["non_denominational"]),
      denominationsJson: JSON.stringify([
        "baptist", "wesleyan", "methodist", "pentecostal", "charismatic",
        "evangelical", "reformed", "assemblies", "christian_missionary_alliance",
        "other_protestant",
      ]),
      excludedDenominationsJson: JSON.stringify([]),
      employmentTypesJson: JSON.stringify(["FULL_TIME"]),
      searchTermsJson: JSON.stringify(ROLE_TERMS),
      reportThreshold: 70,
      autoSubmitEnabled: false,
    },
  });
  console.log("  search preferences: nationwide, relocation open, full-time, autoSubmit OFF");

  const openInputs = await prisma.candidateFact.count({ where: { status: "NOT_PROVIDED" } });
  console.log(`\nDone. ${openInputs} candidate facts are NOT PROVIDED and await your input.`);
  console.log("No candidate facts and no theological positions were invented.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
