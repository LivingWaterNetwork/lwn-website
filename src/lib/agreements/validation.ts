import { z } from "zod";

export const loginSchema = z.object({
  code: z.string().trim().min(1).max(32),
});

export const confirmIdentitySchema = z.object({
  email: z.string().trim().email().max(320),
});

export const consentSchema = z.object({
  consentVersion: z.string().trim().min(1).max(40),
});

export const initialSchema = z.object({
  section: z.string().trim().min(1).max(200),
  initialed: z.boolean(),
});

const dataUrlPng = z
  .string()
  .trim()
  .max(2_000_000)
  .refine((v) => v.startsWith("data:image/png;base64,"), "Signature image must be a PNG data URL.");

export const signSchema = z.object({
  typedName: z.string().trim().min(1).max(200),
  signatureImage: dataUrlPng.optional(),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1).max(200),
});

export const adminCreateAgreementSchema = z.object({
  templateKey: z.string().min(1),
  templateVersion: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  variables: z.record(z.string(), z.unknown()),
  paymentUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  isTest: z.boolean().optional(),
  signers: z
    .array(
      z.object({
        role: z.enum(["partner", "participant", "organization"]),
        name: z.string().trim().min(1).max(200),
        email: z.string().trim().email().max(320),
        title: z.string().trim().max(200).optional(),
      })
    )
    .min(1),
});

export const adminPartnerAcceptSchema = z.object({
  typedName: z.string().trim().min(1).max(200),
  signatureImage: dataUrlPng.optional(),
});

export const adminCountersignSchema = z.object({
  typedName: z.string().trim().min(1).max(200),
  signatureImage: dataUrlPng.optional(),
  // No consentVersion field here: the server always stamps the current
  // CONSENT_VERSION itself (see the countersign route), the same way the
  // participant's own consent route does — the client never gets to choose.
});

export const adminVoidSchema = z.object({
  reason: z.string().trim().min(1).max(2000),
});

export const adminExtendSchema = z.object({
  expiresAt: z.string().datetime(),
});

/** Formats the first Zod issue into a short, user-facing message. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid submission.";
}
