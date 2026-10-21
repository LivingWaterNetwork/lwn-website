import { z } from "zod";

export const createMemberSchema = z.object({
  email: z.string().trim().email().max(320),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  templateKey: z.string().trim().min(1),
  templateVersion: z.string().trim().optional(),
  coachPersonId: z.string().trim().optional(),
  startDate: z.string().trim().min(1),
  endDate: z.string().trim().optional(),
  paymentUrl: z.string().trim().url().optional(),
  isTest: z.boolean().optional(),
});

export const updateEnrollmentSchema = z.object({
  coachPersonId: z.string().trim().nullable().optional(),
  startDate: z.string().trim().nullable().optional(),
  endDate: z.string().trim().nullable().optional(),
  currentPhaseKey: z.string().trim().nullable().optional(),
  modules: z.record(z.string(), z.boolean()).optional(),
  agreementId: z.string().trim().nullable().optional(),
  paymentUrl: z.string().trim().nullable().optional(),
});

export const setStatusSchema = z.object({
  status: z.enum(["active", "paused", "completed", "archived"]),
});

export const updateSessionSchema = z.object({
  scheduledAt: z.string().trim().nullable().optional(),
  durationMin: z.number().int().positive().optional(),
  format: z.enum(["zoom", "phone", "in_person"]).optional(),
  status: z.enum(["scheduled", "held", "rescheduled", "canceled_by_coach", "late_cancel", "missed"]).optional(),
  countsTowardTotal: z.boolean().optional(),
  sharedRecap: z.string().trim().max(10_000).nullable().optional(),
});

export const addPrivateNoteSchema = z.object({
  body: z.string().trim().min(1).max(10_000),
});

export const createStepSchema = z.object({
  title: z.string().trim().min(1).max(300),
  detail: z.string().trim().max(2000).optional(),
  phaseKey: z.string().trim().optional(),
  meetingId: z.string().trim().optional(),
  dueOn: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).optional(),
  order: z.number().int().optional(),
});

export const updateStepSchema = createStepSchema.partial();

export const documentVisibilitySchema = z.object({ visibleToMember: z.boolean() });

export const markPaidSchema = z.object({ paidOn: z.string().trim().min(1), note: z.string().trim().max(500).optional() });
export const adjustInstallmentSchema = z.object({ dueOn: z.string().trim().min(1), note: z.string().trim().min(1).max(500) });
export const waiveInstallmentSchema = z.object({ note: z.string().trim().min(1).max(500) });

export const grantStaffRoleSchema = z.object({
  email: z.string().trim().email().max(320),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  role: z.enum(["coach", "admin"]),
});

export const createPartnerOrgSchema = z.object({
  key: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(200),
});

export const addPartnerUserSchema = z.object({
  partnerOrgId: z.string().trim().min(1),
  email: z.string().trim().email().max(320),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
});

export const grantPartnerAccessSchema = z.object({
  partnerOrgId: z.string().trim().min(1),
  modules: z.array(z.literal("brand_website")).min(1),
  memberConsentConfirmed: z.literal(true),
});

export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request.";
}
