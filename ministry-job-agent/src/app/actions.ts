"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { normalizeQuestion } from "@/lib/answers/normalize";
import { authorizeSubmission, type PackageForApproval } from "@/lib/application/approval-gate";
import { parseArray } from "@/lib/db/json";
import type { QuestionResolution, PackageStatus } from "@/lib/domain/enums";

/**
 * Server actions.
 *
 * Anything that turns unknown information into approved information happens
 * here, and every one of these actions represents a deliberate human decision.
 * Note what is absent: there is no action that submits an application. Reaching
 * a submitted state requires `recordSubmission`, which calls the approval gate
 * and refuses without a live APPROVED record.
 */

export async function approveCandidateFact(formData: FormData) {
  const path = String(formData.get("path"));
  const raw = String(formData.get("value") ?? "").trim();
  if (!raw) return;

  // Store as JSON so booleans and numbers round-trip with their real types.
  let value: unknown = raw;
  if (raw === "true" || raw === "false") value = raw === "true";
  else if (/^-?\d+(\.\d+)?$/.test(raw)) value = Number(raw);

  await prisma.candidateFact.update({
    where: { path },
    data: {
      valueJson: JSON.stringify(value),
      status: "APPROVED",
      approvedAt: new Date(),
      source: String(formData.get("source") ?? "candidate entry"),
    },
  });
  revalidatePath("/candidate");
  revalidatePath("/");
}

export async function approveTheologyPosition(formData: FormData) {
  const topic = String(formData.get("topic"));
  const position = String(formData.get("position") ?? "").trim();
  if (!position) return;

  await prisma.theologyPosition.update({
    where: { topic },
    data: {
      position,
      shortForm: String(formData.get("shortForm") ?? "").trim() || null,
      status: "APPROVED",
      approvedAt: new Date(),
      allowAutomaticUse: formData.get("allowAutomaticUse") === "on",
      source: "candidate entry",
    },
  });
  revalidatePath("/theology");
  revalidatePath("/");
}

export async function approveAnswer(formData: FormData) {
  const id = String(formData.get("id"));
  const answer = String(formData.get("approvedAnswer") ?? "").trim();
  if (!answer) return;

  await prisma.answerBankEntry.update({
    where: { id },
    data: {
      approvedAnswer: answer,
      shortVersion: String(formData.get("shortVersion") ?? "").trim() || null,
      mediumVersion: String(formData.get("mediumVersion") ?? "").trim() || null,
      longVersion: String(formData.get("longVersion") ?? "").trim() || null,
      status: "APPROVED",
      approvedAt: new Date(),
      allowAutomaticUse: formData.get("allowAutomaticUse") === "on",
      source: "candidate entry",
    },
  });
  revalidatePath("/answers");
  revalidatePath("/");
}

/**
 * Answer an item in the human-input queue.
 *
 * Where the request names a `storeTo` target, the answer is persisted so the
 * same question never has to be answered twice — which is the whole point of
 * the queue: it converts one-time human effort into reusable approved material.
 */
export async function answerHumanInput(formData: FormData) {
  const id = String(formData.get("id"));
  const response = String(formData.get("response") ?? "").trim();
  if (!response) return;

  const request = await prisma.humanInputRequest.findUniqueOrThrow({ where: { id } });

  await prisma.humanInputRequest.update({
    where: { id },
    data: { response, status: "ANSWERED", respondedAt: new Date() },
  });

  if (request.questionId) {
    const resolution: QuestionResolution = "RESOLVED";
    await prisma.applicationQuestion.update({
      where: { id: request.questionId },
      data: {
        answerText: response,
        answerSource: "HUMAN",
        resolution,
        resolutionNote: "Answered directly by the candidate.",
        // A one-off human answer is not automatically reusable elsewhere.
        autoUsable: false,
      },
    });
  }

  // Persist reusable answers into the bank.
  if (request.storeTo === "answer_bank") {
    const normalized = normalizeQuestion(request.question);
    const existing = await prisma.answerBankEntry.findFirst({ where: { normalizedQuestion: normalized } });
    if (existing) {
      await prisma.answerBankEntry.update({
        where: { id: existing.id },
        data: { approvedAnswer: response, status: "APPROVED", approvedAt: new Date() },
      });
    } else {
      await prisma.answerBankEntry.create({
        data: {
          category: "uncategorized",
          question: request.question,
          normalizedQuestion: normalized,
          approvedAnswer: response,
          status: "APPROVED",
          approvedAt: new Date(),
          allowAutomaticUse: false,
          source: "human input queue",
        },
      });
    }
  }

  if (request.storeTo?.startsWith("theology:")) {
    const topics = request.storeTo.slice("theology:".length).split(",").filter(Boolean);
    for (const topic of topics) {
      await prisma.theologyPosition.updateMany({
        where: { topic },
        data: { position: response, status: "APPROVED", approvedAt: new Date(), source: "human input queue" },
      });
    }
  }

  await refreshPackageStatus(request.packageId);

  revalidatePath("/queue");
  revalidatePath("/");
}

export async function dismissHumanInput(formData: FormData) {
  const id = String(formData.get("id"));
  const request = await prisma.humanInputRequest.update({
    where: { id },
    data: { status: "DISMISSED", respondedAt: new Date() },
  });
  await refreshPackageStatus(request.packageId);
  revalidatePath("/queue");
}

/** Recompute a package's status from what is actually outstanding. */
async function refreshPackageStatus(packageId: string | null) {
  if (!packageId) return;
  const open = await prisma.humanInputRequest.count({ where: { packageId, status: "OPEN" } });
  const pkg = await prisma.applicationPackage.findUnique({ where: { id: packageId } });
  if (!pkg || pkg.status === "SUBMITTED" || pkg.status === "APPROVED_TO_APPLY") return;

  const status: PackageStatus = open > 0 ? "WAITING_FOR_HUMAN_INPUT" : "READY_FOR_APPROVAL";
  await prisma.applicationPackage.update({ where: { id: packageId }, data: { status } });
  await prisma.opportunity.update({ where: { id: pkg.opportunityId }, data: { status } });
}

/**
 * The APPROVE APPLICATION action.
 *
 * This does NOT submit anything. It records the candidate's decision and freezes
 * a snapshot of exactly what was on screen when they made it. Submission is a
 * separate, manual step.
 */
export async function decideApproval(formData: FormData) {
  const packageId = String(formData.get("packageId"));
  const decision = String(formData.get("decision"));
  if (!["APPROVED", "REJECTED", "CHANGES_REQUESTED"].includes(decision)) return;

  const pkg = await loadPackageForApproval(packageId);
  if (!pkg) return;

  if (decision === "APPROVED") {
    // Refuse to record an approval for something that is not actually ready.
    const gate = authorizeSubmission({ ...pkg, approvals: [{ decision: "APPROVED", decidedAt: new Date(), decidedBy: "candidate" }] });
    if (!gate.canSubmit) {
      await prisma.approvalRecord.create({
        data: {
          packageId,
          decision: "CHANGES_REQUESTED",
          decidedBy: "system",
          snapshotJson: JSON.stringify({ refusedBecause: gate.blockers }),
          notes: `Approval refused — outstanding blockers: ${gate.blockers.join(" | ")}`,
        },
      });
      revalidatePath(`/approve/${packageId}`);
      return;
    }
  }

  await prisma.approvalRecord.create({
    data: {
      packageId,
      decision,
      decidedBy: "candidate",
      snapshotJson: JSON.stringify({
        church: pkg.opportunity.churchName,
        role: pkg.opportunity.title,
        score: pkg.opportunity.score,
        classification: pkg.opportunity.classification,
        resumeVariant: pkg.resumeVariant,
        coverLetter: pkg.coverLetterDraft,
        answers: pkg.questions.map((q) => ({ question: q.questionText, answer: q.answerText, resolution: q.resolution })),
        attestations: pkg.attestations,
        decidedAt: new Date().toISOString(),
      }),
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  if (decision === "APPROVED") {
    await prisma.applicationPackage.update({ where: { id: packageId }, data: { status: "APPROVED_TO_APPLY" } });
    await prisma.opportunity.update({
      where: { id: pkg.opportunity.id },
      data: { status: "APPROVED_TO_APPLY" },
    });
    await prisma.decisionLog.create({
      data: {
        opportunityId: pkg.opportunity.id,
        decision: "APPROVED_TO_APPLY",
        scoreAtDecision: pkg.opportunity.score,
        resumeVariant: pkg.resumeVariant,
        reason: String(formData.get("notes") ?? "") || null,
      },
    });
  } else {
    await prisma.decisionLog.create({
      data: {
        opportunityId: pkg.opportunity.id,
        decision: "DECLINED",
        scoreAtDecision: pkg.opportunity.score,
        reason: String(formData.get("notes") ?? "") || null,
      },
    });
  }

  await prisma.statusEvent.create({
    data: {
      opportunityId: pkg.opportunity.id,
      toStatus: decision === "APPROVED" ? "APPROVED_TO_APPLY" : "DECLINED",
      actor: "candidate",
      note: `Approval decision: ${decision}`,
    },
  });

  revalidatePath(`/approve/${packageId}`);
  revalidatePath("/pipeline");
  revalidatePath("/");
}

/**
 * Record that an application was actually submitted.
 *
 * Called only after the candidate submits it themselves. The gate is checked
 * again here so the tracker can never claim a submission the rules forbade.
 */
export async function recordSubmission(formData: FormData) {
  const packageId = String(formData.get("packageId"));
  const pkg = await loadPackageForApproval(packageId);
  if (!pkg) return;

  const gate = authorizeSubmission(pkg);
  if (!gate.canSubmit) return;

  await prisma.applicationPackage.update({
    where: { id: packageId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      submissionNote: String(formData.get("note") ?? "") || null,
    },
  });
  await prisma.opportunity.update({
    where: { id: pkg.opportunity.id },
    data: { status: "APPLICATION_SUBMITTED" },
  });

  // Standard follow-up cadence: two weeks after submission.
  const due = new Date();
  due.setDate(due.getDate() + 14);
  await prisma.followUp.create({
    data: { opportunityId: pkg.opportunity.id, kind: "APPLICATION_FOLLOW_UP", dueDate: due },
  });

  await prisma.statusEvent.create({
    data: { opportunityId: pkg.opportunity.id, toStatus: "APPLICATION_SUBMITTED", actor: "candidate" },
  });

  revalidatePath(`/approve/${packageId}`);
  revalidatePath("/");
}

export async function loadPackageForApproval(packageId: string): Promise<PackageForApproval | null> {
  const pkg = await prisma.applicationPackage.findUnique({
    where: { id: packageId },
    include: {
      questions: true,
      approvals: true,
      humanInputs: { where: { status: "OPEN" } },
      opportunity: { include: { church: true } },
    },
  });
  if (!pkg) return null;

  return {
    id: pkg.id,
    status: pkg.status as PackageStatus,
    resumeVariant: pkg.resumeVariant,
    coverLetterDraft: pkg.coverLetterDraft,
    questions: pkg.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      required: q.required,
      resolution: q.resolution as QuestionResolution,
      answerText: q.answerText,
    })),
    attestations: parseArray<string>(pkg.attestationsJson),
    openHumanInputs: pkg.humanInputs.map((h) => h.question),
    approvals: pkg.approvals.map((a) => ({ decision: a.decision, decidedAt: a.decidedAt, decidedBy: a.decidedBy })),
    opportunity: {
      id: pkg.opportunity.id,
      title: pkg.opportunity.title,
      churchName: pkg.opportunity.church.name,
      onHold: pkg.opportunity.onHold || pkg.opportunity.church.onHold,
      classification: pkg.opportunity.classification,
      score: pkg.opportunity.score,
    },
  };
}
