import type { PackageStatus, QuestionResolution } from "../domain/enums";

/**
 * The human approval gate.
 *
 * Phase 1 has exactly one rule about submission: it does not happen without an
 * explicit APPROVE APPLICATION decision from the candidate. This module is the
 * only thing in the codebase that can authorize a submission, and it fails
 * closed — every unhandled case returns "blocked".
 */

export interface PackageForApproval {
  id: string;
  status: PackageStatus;
  resumeVariant: string | null;
  coverLetterDraft: string | null;
  questions: Array<{
    id: string;
    questionText: string;
    required: boolean;
    resolution: QuestionResolution;
    answerText: string | null;
  }>;
  attestations: string[];
  /** Open items in the human-input queue attached to this package. */
  openHumanInputs: string[];
  approvals: Array<{ decision: string; decidedAt: Date; decidedBy: string }>;
  opportunity: {
    id: string;
    title: string;
    churchName: string;
    onHold: boolean;
    classification: string | null;
    score: number | null;
  };
}

export interface GateResult {
  /** True only when a human has approved and nothing is outstanding. */
  canSubmit: boolean;
  blockers: string[];
  warnings: string[];
}

export const NEVER_AUTONOMOUS = [
  "Final application submission",
  "Sending emails or messages",
  "Contacting references",
  "Accepting interview times",
  "Signing documents",
  "Affirming statements of faith",
  "Answering unapproved theological questions",
  "Salary negotiation",
  "Legal attestations",
] as const;

/** Can this package be shown on the approval screen yet? */
export function readinessForApproval(pkg: PackageForApproval): GateResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (pkg.opportunity.onHold) {
    blockers.push(
      `${pkg.opportunity.churchName} is on the HOLD — DO NOT APPLY list. Remove the hold before preparing an application.`,
    );
  }

  const unresolvedRequired = pkg.questions.filter(
    (q) => q.required && q.resolution !== "RESOLVED",
  );
  for (const q of unresolvedRequired) {
    const label =
      q.resolution === "THEOLOGICAL_REVIEW_REQUIRED"
        ? "THEOLOGICAL REVIEW REQUIRED"
        : q.resolution === "ATTESTATION_REVIEW_REQUIRED"
          ? "ATTESTATION REVIEW REQUIRED"
          : "HUMAN INPUT REQUIRED";
    blockers.push(`${label}: "${q.questionText}"`);
  }

  const unresolvedOptional = pkg.questions.filter((q) => !q.required && q.resolution !== "RESOLVED");
  for (const q of unresolvedOptional) {
    warnings.push(`Optional question left unanswered: "${q.questionText}"`);
  }

  // Anything sitting in the human-input queue for this package blocks approval.
  // Without this, a package whose only gaps are cover-letter facts (which are
  // queue items rather than form questions) would slip through as "ready".
  for (const q of pkg.openHumanInputs) {
    blockers.push(`HUMAN INPUT REQUIRED: ${q}`);
  }

  if (!pkg.resumeVariant) blockers.push("No resume variant selected.");

  // A [NEEDS:] marker is the drafter refusing to invent a fact. It must never
  // reach a church, so it blocks rather than warns.
  const markers = pkg.coverLetterDraft?.match(/\[NEEDS:[^\]]*\]/g) ?? [];
  for (const m of markers) {
    blockers.push(`Cover letter is unfinished — ${m}`);
  }

  if (!pkg.coverLetterDraft || pkg.coverLetterDraft.trim().length < 200) {
    warnings.push("Cover letter draft is missing or very short.");
  }
  for (const a of pkg.attestations) {
    warnings.push(`Requires affirming: "${a}" — read this before approving.`);
  }

  return { canSubmit: blockers.length === 0, blockers, warnings };
}

/**
 * The submission authorization check. Called immediately before any code path
 * that would submit. Requires a live APPROVED record and a clean readiness pass.
 */
export function authorizeSubmission(pkg: PackageForApproval): GateResult {
  const readiness = readinessForApproval(pkg);
  const blockers = [...readiness.blockers];

  const approved = pkg.approvals.filter((a) => a.decision === "APPROVED");
  if (approved.length === 0) {
    blockers.push(
      "APPROVE APPLICATION has not been given. No application may be submitted without the candidate's explicit approval.",
    );
  }

  // A later REJECTED or CHANGES_REQUESTED supersedes an earlier approval.
  const latest = [...pkg.approvals].sort((a, b) => b.decidedAt.getTime() - a.decidedAt.getTime())[0];
  if (latest && latest.decision !== "APPROVED") {
    blockers.push(
      `The most recent decision on this package was ${latest.decision}. A fresh approval is required.`,
    );
  }

  if (pkg.status === "SUBMITTED") {
    blockers.push("This application has already been submitted.");
  }

  return { canSubmit: blockers.length === 0, blockers, warnings: readiness.warnings };
}

/** Everything the approval screen must display, assembled in one place. */
export interface ApprovalSnapshot {
  church: string;
  role: string;
  score: number | null;
  classification: string | null;
  compensation: string;
  theologyNotes: string[];
  majorConcerns: string[];
  resumeVariant: string | null;
  coverLetter: string | null;
  attachments: string[];
  answers: Array<{ question: string; answer: string | null; resolution: QuestionResolution }>;
  attestations: string[];
  generatedAt: string;
}
