import type { PrismaClient } from "@prisma/client";
import type { ScoreResult, ScoringInput, ResearchClaim } from "../domain/types";
import { parseArray, parseJson } from "../db/json";
import { classifyLane } from "../domain/lanes";
import { scoreOpportunity } from "./engine";

/**
 * Loads everything the scoring engine needs from the database and writes the
 * result back. Kept separate from engine.ts so the engine stays a pure function
 * that unit tests can drive without a database.
 */

export async function buildScoringInput(
  prisma: PrismaClient,
  opportunityId: string,
): Promise<ScoringInput> {
  const opp = await prisma.opportunity.findUniqueOrThrow({
    where: { id: opportunityId },
    include: { church: { include: { facts: true } } },
  });

  const prefs = await prisma.searchPreference.findUnique({ where: { id: "default" } });

  // Only APPROVED theology counts. Drafts and NOT_YET_DEFINED are invisible here.
  const approvedTheology = await prisma.theologyPosition.findMany({
    where: { status: "APPROVED" },
    select: { topic: true },
  });

  const approvedCredentials = await prisma.candidateRecord.findMany({
    where: { kind: { in: ["credential", "ordination"] }, status: "APPROVED" },
  });
  const approvedEducation = await prisma.candidateRecord.findMany({
    where: { kind: "education", status: "APPROVED" },
  });

  const relocationFact = await prisma.candidateFact.findUnique({
    where: { path: "relocation.open_to_relocation" },
  });
  const relocationApproved =
    relocationFact?.status === "APPROVED"
      ? parseJson<boolean>(relocationFact.valueJson, true)
      : (prefs?.relocationOpen ?? true);

  const salaryMinFact = await prisma.candidateFact.findUnique({ where: { path: "salary.minimum" } });
  const salaryPrefFact = await prisma.candidateFact.findUnique({ where: { path: "salary.preferred" } });

  const responsibilities = parseArray<string>(opp.responsibilitiesJson);
  const qualifications = parseArray<string>(opp.qualificationsJson);
  const body = opp.descriptionText ?? "";

  // The lane is derived data, not user input, so it is re-derived on every
  // score rather than trusted from import time. Classification logic improves;
  // a lane persisted by an older version should not outlive it.
  const match = classifyLane(opp.title, `${body} ${responsibilities.join(" ")}`);
  const lane = match ? { key: match.lane.key, confidence: match.confidence } : null;

  const churchFacts = opp.church.facts;
  const theologyFacts = churchFacts.filter((f) => f.category === "theology");
  const cultureClaims: ResearchClaim[] = churchFacts
    .filter((f) => f.category === "culture" || f.category === "ministry_philosophy")
    .map((f) => ({
      category: f.category as ResearchClaim["category"],
      claim: f.claim,
      kind: f.kind as ResearchClaim["kind"],
      sourceUrl: f.sourceUrl,
      confidence: f.confidence as ResearchClaim["confidence"],
    }));

  return {
    title: opp.title,
    lane: lane?.key ?? null,
    laneConfidence: lane?.confidence ?? 0,
    bodyText: body,
    responsibilities,
    qualifications,
    church: {
      name: opp.church.name,
      denomination: opp.church.denomination,
      network: opp.church.network,
      onHold: opp.church.onHold || opp.onHold,
      researched: opp.church.researchStatus === "RESEARCHED",
    },
    theology: {
      approvedTopics: approvedTheology.map((t) => t.topic),
      churchSignals: theologyFacts.map((f) => f.claim.toLowerCase()),
      statementOfFaithFound: !!opp.church.statementOfFaithUrl,
    },
    cultureClaims,
    compensation: {
      salaryMin: opp.salaryMin,
      salaryMax: opp.salaryMax,
      benefits: parseArray<string>(opp.benefitsJson),
      housingNote: opp.housingNote,
      relocationNote: opp.relocationNote,
    },
    location: { city: opp.city, state: opp.state },
    candidate: {
      approvedCredentials: approvedCredentials.map((r) => {
        const p = parseJson<Record<string, unknown>>(r.payload, {});
        return String(p.name ?? p.type ?? "");
      }),
      approvedEducation: approvedEducation.map((r) => {
        const p = parseJson<Record<string, unknown>>(r.payload, {});
        return `${p.credential ?? ""} ${p.field ?? ""}`.trim();
      }),
      relocationOpen: relocationApproved,
    },
    preferences: {
      minSalary:
        salaryMinFact?.status === "APPROVED"
          ? parseJson<number | null>(salaryMinFact.valueJson, null)
          : (prefs?.minSalary ?? null),
      preferredSalary:
        salaryPrefFact?.status === "APPROVED"
          ? parseJson<number | null>(salaryPrefFact.valueJson, null)
          : (prefs?.preferredSalary ?? null),
      nationwide: prefs?.nationwide ?? true,
      states: parseArray<string>(prefs?.statesJson),
    },
  };
}

/** Score one opportunity and persist the result, including its status transition. */
export async function scoreAndPersist(
  prisma: PrismaClient,
  opportunityId: string,
): Promise<ScoreResult> {
  const input = await buildScoringInput(prisma, opportunityId);
  const result = scoreOpportunity(input);

  const before = await prisma.opportunity.findUniqueOrThrow({ where: { id: opportunityId } });

  // Classification maps onto the tracker's status vocabulary, but only for
  // opportunities still in the early pipeline. A role already in interviews
  // does not get knocked back to "REVIEW" by a re-score.
  const EARLY = ["DISCOVERED", "RESEARCHING", "PASS", "REVIEW", "STRONG", "PRIORITY"];
  const nextStatus = EARLY.includes(before.status) ? result.classification : before.status;

  await prisma.opportunity.update({
    where: { id: opportunityId },
    data: {
      score: result.score,
      classification: result.classification,
      scoreBreakdownJson: JSON.stringify(result.dimensions),
      redFlagsJson: JSON.stringify(result.redFlags),
      unknownsJson: JSON.stringify(result.unknowns),
      scoredAt: new Date(),
      ceiling: result.ceiling,
      provisional: result.provisional,
      researchRecommended: result.researchRecommended,
      lane: input.lane,
      status: nextStatus,
      onHold: input.church.onHold ? true : before.onHold,
    },
  });

  if (nextStatus !== before.status) {
    await prisma.statusEvent.create({
      data: {
        opportunityId,
        fromStatus: before.status,
        toStatus: nextStatus,
        actor: "scoring-engine",
        note: `Scored ${result.score}/100 → ${result.classification}${
          result.classification !== result.rawClassification
            ? ` (red-flag override from ${result.rawClassification})`
            : ""
        }`,
      },
    });
  }

  return result;
}
