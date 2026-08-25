/**
 * Import source documents and postings from ./inbox.
 *
 * Two kinds of file are recognized:
 *   - Job postings: .json files matching the posting shape, or .md files with a
 *     YAML-ish front block. These become opportunities (deduped).
 *   - Candidate source material: resumes, bylaws, curricula, transcripts. These
 *     become ImportedSource rows plus ExtractedClaim rows, all UNVERIFIED_IMPORT.
 *
 * Nothing imported is ever auto-approved. Review it in the dashboard.
 */
import { createHash } from "node:crypto";
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { PrismaClient } from "@prisma/client";
import { extractClaims, isSupportedImport } from "../src/lib/imports/extract";
import { dedupeKey, looksLikeDuplicate, pickCanonicalUrl } from "../src/lib/dedup/dedupe";
import { classifyLane } from "../src/lib/domain/lanes";
import { coercePosting } from "../src/lib/imports/coerce";
import type { RawPosting } from "../src/lib/domain/types";

const prisma = new PrismaClient();
const INBOX = join(process.cwd(), "inbox");
const TEXT_STORE = join(process.cwd(), "data", "imports");

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

/** Extract plaintext from a source document. */
async function readText(path: string): Promise<string | null> {
  const ext = extname(path).toLowerCase();
  if ([".txt", ".md", ".csv", ".json"].includes(ext)) return readFile(path, "utf8");

  if (ext === ".pdf") {
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: await readFile(path) });
      const result = await parser.getText();
      await parser.destroy();
      return result.text;
    } catch (err) {
      console.log(`    (pdf extraction failed: ${(err as Error).message})`);
      return null;
    }
  }

  if (ext === ".docx") {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ path });
      return result.value;
    } catch (err) {
      console.log(`    (docx extraction failed: ${(err as Error).message})`);
      return null;
    }
  }

  return null;
}

/**
 * JSON gives us `unknown`. coercePosting validates and converts every field —
 * notably turning date strings into Date objects, which Prisma requires and
 * which the RawPosting type cannot enforce across a JSON.parse boundary.
 */

async function importPosting(posting: RawPosting): Promise<"created" | "merged"> {
  const churchSlug = slugify(posting.churchName);
  const church = await prisma.church.upsert({
    where: { slug: churchSlug },
    update: {},
    create: {
      slug: churchSlug,
      name: posting.churchName,
      city: posting.city ?? null,
      state: posting.state ?? null,
    },
  });

  const key = dedupeKey(posting);
  let existing = await prisma.opportunity.findUnique({ where: { dedupeKey: key }, include: { sources: true } });

  // Similarity pass for near-misses the deterministic key does not catch.
  if (!existing) {
    const siblings = await prisma.opportunity.findMany({
      where: { churchId: church.id },
      include: { sources: true },
    });
    for (const s of siblings) {
      const verdict = looksLikeDuplicate(posting, {
        source: "db",
        sourceUrl: s.canonicalUrl ?? "",
        title: s.title,
        churchName: church.name,
        state: s.state,
        city: s.city,
        descriptionText: s.descriptionText,
        canonicalUrl: s.canonicalUrl,
      });
      if (verdict.isDuplicate && verdict.confidence >= 0.8) {
        existing = s;
        break;
      }
    }
  }

  if (existing) {
    await prisma.opportunitySource.upsert({
      where: { opportunityId_url: { opportunityId: existing.id, url: posting.sourceUrl } },
      update: {},
      create: {
        opportunityId: existing.id,
        source: posting.source,
        url: posting.sourceUrl,
        rawTitle: posting.title,
      },
    });

    // Re-elect the canonical URL now that there is a new source in the mix.
    const sources = await prisma.opportunitySource.findMany({ where: { opportunityId: existing.id } });
    const canonical = pickCanonicalUrl(
      sources.map((s) => ({ source: s.source, url: s.url })),
      church.website,
    );
    if (canonical && canonical !== existing.canonicalUrl) {
      await prisma.opportunity.update({ where: { id: existing.id }, data: { canonicalUrl: canonical } });
    }
    return "merged";
  }

  const body = `${posting.descriptionText ?? ""} ${(posting.responsibilities ?? []).join(" ")}`;
  const lane = classifyLane(posting.title, body);

  const created = await prisma.opportunity.create({
    data: {
      churchId: church.id,
      title: posting.title,
      lane: lane?.lane.key ?? null,
      city: posting.city ?? null,
      state: posting.state ?? null,
      employmentType: posting.employmentType ?? "UNKNOWN",
      descriptionText: posting.descriptionText ?? null,
      responsibilitiesJson: JSON.stringify(posting.responsibilities ?? []),
      qualificationsJson: JSON.stringify(posting.qualifications ?? []),
      canonicalUrl: posting.canonicalUrl ?? posting.sourceUrl,
      dedupeKey: key,
      postedDate: posting.postedDate ?? null,
      deadline: posting.deadline ?? null,
      salaryMin: posting.salaryMin ?? null,
      salaryMax: posting.salaryMax ?? null,
      salaryNote: posting.salaryNote ?? null,
      benefitsJson: JSON.stringify(posting.benefits ?? []),
      status: "DISCOVERED",
    },
  });

  await prisma.opportunitySource.create({
    data: {
      opportunityId: created.id,
      source: posting.source,
      url: posting.sourceUrl,
      isCanonical: !!posting.canonicalUrl,
      rawTitle: posting.title,
    },
  });
  await prisma.statusEvent.create({
    data: { opportunityId: created.id, toStatus: "DISCOVERED", note: `Imported from ${posting.source}.` },
  });
  return "created";
}

async function main() {
  await mkdir(TEXT_STORE, { recursive: true });

  let files: string[];
  try {
    files = await readdir(INBOX);
  } catch {
    console.log("No ./inbox directory. Create it and drop files in.");
    return;
  }

  const usable = files.filter((f) => !f.startsWith("."));
  if (usable.length === 0) {
    console.log("Inbox is empty.");
    console.log("  · Job postings: drop .json files matching the RawPosting shape (see docs/importing.md).");
    console.log("  · Source documents: drop .pdf, .docx, .md, .txt, or .csv files.");
    return;
  }

  let created = 0;
  let merged = 0;
  let documents = 0;
  let claimsFound = 0;

  for (const file of usable) {
    const path = join(INBOX, file);

    // JSON may be a posting or an array of postings.
    if (extname(file).toLowerCase() === ".json") {
      const raw = await readFile(path, "utf8");
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.log(`  skipped ${file}: not valid JSON`);
        continue;
      }
      const list = Array.isArray(parsed) ? parsed : [parsed];
      const postings = list.map(coercePosting).filter((p): p is RawPosting => p !== null);
      const rejected = list.length - postings.length;
      if (rejected > 0) {
        console.log(`  ${file}: skipped ${rejected} entr${rejected === 1 ? "y" : "ies"} missing a title or church name`);
      }
      if (postings.length > 0) {
        for (const p of postings) {
          const outcome = await importPosting(p);
          if (outcome === "created") created += 1;
          else merged += 1;
        }
        console.log(`  ${file}: ${postings.length} posting(s)`);
        continue;
      }
    }

    if (!isSupportedImport(file)) {
      console.log(`  skipped ${file}: unsupported type`);
      continue;
    }

    const text = await readText(path);
    if (text == null) {
      console.log(
        `  skipped ${file}: could not extract text. If it is a scanned PDF, paste the text into a .md file instead.`,
      );
      continue;
    }

    const bytes = Buffer.byteLength(text);
    const sha = createHash("sha256").update(text).digest("hex");
    const existing = await prisma.importedSource.findUnique({ where: { sha256: sha } });
    if (existing) {
      console.log(`  ${file}: already imported, unchanged`);
      continue;
    }

    const textPath = join("data", "imports", `${basename(file, extname(file))}.txt`);
    await writeFile(join(process.cwd(), textPath), text, "utf8");

    const source = await prisma.importedSource.create({
      data: { filename: file, mediaType: extname(file).slice(1), sha256: sha, bytes, textPath },
    });

    const claims = extractClaims(text);
    for (const c of claims) {
      await prisma.extractedClaim.create({
        data: {
          importedSourceId: source.id,
          claimText: c.claimText,
          suggestedPath: c.suggestedPath,
          suggestedKind: c.suggestedKind,
          suggestedValue: c.suggestedValue,
          excerpt: c.excerpt,
          status: "UNVERIFIED_IMPORT",
        },
      });
    }

    documents += 1;
    claimsFound += claims.length;
    console.log(`  ${file}: ${claims.length} claim(s) extracted → UNVERIFIED_IMPORT`);
  }

  console.log(`\nOpportunities: ${created} created, ${merged} merged into existing records.`);
  console.log(`Documents: ${documents} imported, ${claimsFound} claim(s) awaiting your review.`);
  if (claimsFound > 0) {
    console.log("\nNothing extracted is usable in an application until you approve it in /candidate.");
  }
  if (created > 0) console.log("Run `npm run score` to score the new opportunities.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
