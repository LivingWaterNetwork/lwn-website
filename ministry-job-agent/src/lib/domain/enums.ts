/**
 * Every enum-ish column in the SQLite schema is a String. These are the legal
 * values, plus the TypeScript unions the rest of the app programs against.
 */

export const VERIFICATION_STATUSES = [
  "NOT_PROVIDED",
  "UNVERIFIED_IMPORT",
  "APPROVED",
  "REJECTED",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const THEOLOGY_STATUSES = ["NOT_YET_DEFINED", "APPROVED", "NEEDS_REVIEW"] as const;
export type TheologyStatus = (typeof THEOLOGY_STATUSES)[number];

export const ANSWER_STATUSES = ["DRAFT", "APPROVED", "RETIRED"] as const;
export type AnswerStatus = (typeof ANSWER_STATUSES)[number];

export const CLASSIFICATIONS = ["PRIORITY", "STRONG", "REVIEW", "PASS"] as const;
export type Classification = (typeof CLASSIFICATIONS)[number];

/** The tracker's status vocabulary, in rough pipeline order. */
export const OPPORTUNITY_STATUSES = [
  "DISCOVERED",
  "RESEARCHING",
  "PASS",
  "REVIEW",
  "STRONG",
  "PRIORITY",
  "WAITING_FOR_HUMAN_INPUT",
  "READY_FOR_APPROVAL",
  "APPROVED_TO_APPLY",
  "APPLICATION_STARTED",
  "APPLICATION_SUBMITTED",
  "FOLLOW_UP_DUE",
  "FOLLOW_UP_SENT",
  "INTERVIEW_REQUESTED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_ROUND_1",
  "INTERVIEW_ROUND_2",
  "FINAL_INTERVIEW",
  "REFERENCE_CHECK",
  "OFFER",
  "DECLINED",
  "REJECTED",
  "WITHDRAWN",
  "HOLD",
  "CLOSED",
] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

/** Statuses that mean "this opportunity is no longer moving forward". */
export const TERMINAL_STATUSES: readonly OpportunityStatus[] = [
  "PASS",
  "DECLINED",
  "REJECTED",
  "WITHDRAWN",
  "CLOSED",
];

export const PACKAGE_STATUSES = [
  "DRAFT",
  "WAITING_FOR_HUMAN_INPUT",
  "READY_FOR_APPROVAL",
  "APPROVED_TO_APPLY",
  "SUBMITTED",
  "CLOSED",
] as const;
export type PackageStatus = (typeof PACKAGE_STATUSES)[number];

export const QUESTION_RESOLUTIONS = [
  "RESOLVED",
  "HUMAN_INPUT_REQUIRED",
  "THEOLOGICAL_REVIEW_REQUIRED",
  "ATTESTATION_REVIEW_REQUIRED",
] as const;
export type QuestionResolution = (typeof QUESTION_RESOLUTIONS)[number];

export const ANSWER_SOURCES = ["ANSWER_BANK", "CANDIDATE_FACT", "THEOLOGY", "HUMAN"] as const;
export type AnswerSource = (typeof ANSWER_SOURCES)[number];

export const HUMAN_INPUT_KINDS = [
  "CANDIDATE_FACT",
  "THEOLOGY",
  "APPLICATION_QUESTION",
  "ATTESTATION",
  "COMPENSATION",
] as const;
export type HumanInputKind = (typeof HUMAN_INPUT_KINDS)[number];

/** Research claims are either observed and cited, or they are inference. Never both. */
export const CLAIM_KINDS = ["VERIFIED_FACT", "INFERENCE"] as const;
export type ClaimKind = (typeof CLAIM_KINDS)[number];

export const AUTOMATION_STATUSES = [
  "RUNNING",
  "PAUSED_FOR_HUMAN",
  "STOPPED_SAFETY",
  "COMPLETED_DRAFT",
  "FAILED",
] as const;
export type AutomationStatus = (typeof AUTOMATION_STATUSES)[number];

export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "UNKNOWN"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

/** Sentinel used everywhere a value is genuinely absent. Never a placeholder fact. */
export const NOT_PROVIDED = "NOT PROVIDED" as const;
