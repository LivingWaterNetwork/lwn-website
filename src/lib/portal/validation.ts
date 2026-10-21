import { z } from "zod";

export const requestCodeSchema = z.object({
  email: z.string().trim().email().max(320),
});

export const verifyCodeSchema = z.object({
  email: z.string().trim().email().max(320),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export const continueLinkSchema = z.object({
  token: z.string().trim().min(1).max(200),
});

export const memberStepUpdateSchema = z.object({
  status: z.enum(["open", "done"]),
  memberNote: z.string().trim().max(500).optional(),
});

export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request.";
}
