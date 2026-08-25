import type { PrismaClient } from "@prisma/client";
import { parseArray, parseJson } from "../db/json";
import { resolveQuestion, type ResolverContext, type QuestionInput } from "../answers/resolver";
import { selectResumeVariant } from "../resumes/variants";
import { selectPortfolio } from "../portfolio/assets";
import { draftCoverLetter } from "./cover-letter";
import type { ResearchClaim } from "../domain/types";

/**
 * Assembles an application package for an opportunity.
 *
 * The builder resolves every captured question through the answer resolver, and
 * every question that does not resolve becomes a HumanInputRequest row. That is
 * why a package's status is derived rather than set: it is
 * WAITING_FOR_HUMAN_INPUT exactly when something is outstanding, and cannot be
 * talked into READY_FOR_APPROVAL by any other code path.
 */

export async function loadResolverContext(prisma: PrismaClient): Promise<ResolverContext> {
  const [answers, theology, facts] = await Promise.all([
    prisma.answerBankEntry.findMany({ where: { status: "APPROVED" } }),
    prisma.theologyPosition.findMany(),
    prisma.candidateFact.findMany(),
  ]);

  return {
    answerBank: answers.map((a) => ({
      id: a.id,
      category: a.category,
      question: a.question,
      approvedAnswer: a.approvedAnswer,
      shortVersion: a.shortVersion,
      mediumVersion: a.mediumVersion,
      longVersion: a.longVersion,
      keywords: parseArray<string>(a.keywordsJson),
      status: a.status,
      allowAutomaticUse: a.allowAutomaticUse,
    })),
    theology: theology.map((t) => ({
      topic: t.topic,
      displayName: t.displayName,
      status: t.status,
      position: t.position,
      shortForm: t.shortForm,
      allowAutomaticUse: t.allowAutomaticUse,
    })),
    facts: facts.map((f) => ({
      path: f.path,
      label: f.label,
      value: parseJson<unknown>(f.valueJson, null),
      status: f.status,
    })),
  };
}

export interface BuildOptions {
  /** Questions captured from the application form, if a capture pass has run. */
  capturedQuestions?: QuestionInput[];
}

export async function buildPackage(
  prisma: PrismaClient,
  opportunityId: string,
  options: BuildOptions = {},
) {
  const opp = await prisma.opportunity.findUniqueOrThrow({
    where: { id: opportunityId },
    include: { church: { include: { facts: true } } },
  });

  if (opp.church.onHold || opp.onHold) {
    throw new Error(
      `${opp.church.name} is on the HOLD — DO NOT APPLY list (${opp.church.holdReason ?? opp.holdReason ?? "no reason recorded"}). Remove the hold before preparing an application.`,
    );
  }

  const ctx = await loadResolverContext(prisma);
  const body = `${opp.descriptionText ?? ""} ${parseArray<string>(opp.responsibilitiesJson).join(" ")}`;

  const resume = selectResumeVariant(opp.lane, body);
  const portfolio = selectPortfolio(opp.lane, body);

  const claims: ResearchClaim[] = opp.church.facts.map((f) => ({
    category: f.category as ResearchClaim["category"],
    claim: f.claim,
    kind: f.kind as ResearchClaim["kind"],
    sourceUrl: f.sourceUrl,
  }));

  const approvedFacts = Object.fromEntries(
    ctx.facts.filter((f) => f.status === "APPROVED").map((f) => [f.path, f.value]),
  );

  const callingEntry = ctx.answerBank.find((a) => a.category === "pastoral_calling");
  const philosophyEntry = ctx.answerBank.find((a) => a.category === "ministry_philosophy");

  const letter = draftCoverLetter({
    churchName: opp.church.name,
    roleTitle: opp.title,
    lane: opp.lane,
    researchClaims: claims,
    portfolioKeys: portfolio.map((p) => p.key),
    approvedFacts,
    callingStatement: callingEntry?.approvedAnswer || null,
    ministryPhilosophy: philosophyEntry?.approvedAnswer || null,
  });

  const pkg = await prisma.applicationPackage.upsert({
    where: { opportunityId },
    update: {
      resumeVariant: resume.key,
      resumeRationale: resume.rationale,
      coverLetterAngle: letter.angle,
      coverLetterDraft: letter.body,
      portfolioItemsJson: JSON.stringify(portfolio),
      preparedAt: new Date(),
    },
    create: {
      opportunityId,
      resumeVariant: resume.key,
      resumeRationale: resume.rationale,
      coverLetterAngle: letter.angle,
      coverLetterDraft: letter.body,
      portfolioItemsJson: JSON.stringify(portfolio),
      status: "DRAFT",
      preparedAt: new Date(),
    },
  });

  // Resolve captured form questions.
  const attestations: string[] = [];
  if (options.capturedQuestions?.length) {
    await prisma.applicationQuestion.deleteMany({ where: { packageId: pkg.id } });

    for (const q of options.capturedQuestions) {
      const resolved = resolveQuestion(q, ctx);
      const created = await prisma.applicationQuestion.create({
        data: {
          packageId: pkg.id,
          questionText: q.questionText,
          fieldType: q.fieldType ?? "TEXT",
          required: q.required ?? true,
          answerText: resolved.answerText,
          answerSource: resolved.answerSource,
          answerBankId: resolved.answerBankId,
          resolution: resolved.resolution,
          resolutionNote: resolved.note,
          autoUsable: resolved.autoUsable,
        },
      });

      if (resolved.resolution === "ATTESTATION_REVIEW_REQUIRED") attestations.push(q.questionText);

      if (resolved.resolution !== "RESOLVED") {
        const kind =
          resolved.resolution === "THEOLOGICAL_REVIEW_REQUIRED"
            ? "THEOLOGY"
            : resolved.resolution === "ATTESTATION_REVIEW_REQUIRED"
              ? "ATTESTATION"
              : "APPLICATION_QUESTION";

        const existing = await prisma.humanInputRequest.findFirst({
          where: { packageId: pkg.id, question: q.questionText, status: "OPEN" },
        });
        if (!existing) {
          await prisma.humanInputRequest.create({
            data: {
              kind,
              question: q.questionText,
              context: resolved.note,
              opportunityId,
              packageId: pkg.id,
              questionId: created.id,
              storeTo:
                kind === "THEOLOGY"
                  ? `theology:${resolved.theologyTopics.join(",")}`
                  : kind === "APPLICATION_QUESTION"
                    ? "answer_bank"
                    : null,
            },
          });
        }
      }
    }
  }

  // Cover-letter gaps are human input too — an unfinished letter must not slip through.
  for (const need of letter.needs) {
    const question = `Cover letter needs: ${need}`;
    const existing = await prisma.humanInputRequest.findFirst({
      where: { packageId: pkg.id, question, status: "OPEN" },
    });
    if (existing) continue;
    await prisma.humanInputRequest.create({
      data: {
        kind: "CANDIDATE_FACT",
        question,
        context: `Draft cover letter for ${opp.church.name} — ${opp.title} contains a [NEEDS:] marker that must be filled before this can be approved.`,
        opportunityId,
        packageId: pkg.id,
      },
    });
  }

  const openInputs = await prisma.humanInputRequest.count({
    where: { packageId: pkg.id, status: "OPEN" },
  });

  const status = openInputs > 0 ? "WAITING_FOR_HUMAN_INPUT" : "READY_FOR_APPROVAL";
  await prisma.applicationPackage.update({
    where: { id: pkg.id },
    data: { status, attestationsJson: JSON.stringify(attestations) },
  });

  await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { status: openInputs > 0 ? "WAITING_FOR_HUMAN_INPUT" : "READY_FOR_APPROVAL" },
  });

  await prisma.statusEvent.create({
    data: {
      opportunityId,
      toStatus: status,
      actor: "package-builder",
      note: `Package prepared. ${openInputs} item(s) require human input.`,
    },
  });

  return { packageId: pkg.id, status, openInputs, resume, portfolio, letter };
}
