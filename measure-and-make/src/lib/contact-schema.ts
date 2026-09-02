import { z } from "zod";

// Shared by the client form and the server route so the two cannot drift. The
// server validates independently — client-side validation is never trusted.

export const ORGANIZATION_TYPES = [
  "Church / Ministry",
  "Nonprofit",
  "Small or Growing Business",
  "Entrepreneur / Founder",
  "Community Initiative",
  "Other",
] as const;

export const INTEREST_OPTIONS = [
  "Strategy & Organizational Architecture",
  "Websites & Digital Platforms",
  "Operations, AI & Automation",
  "Initiatives & Program Launches",
  "Not sure yet",
] as const;

export const TIMELINE_OPTIONS = [
  "Still exploring",
  "Next 1-3 months",
  "3-6 months",
  "6+ months",
] as const;

/**
 * Ranges exist so an inquiry can be triaged. They are a form option, not a
 * published price list, and no pricing claim appears anywhere on the site.
 */
export const BUDGET_OPTIONS = [
  "Not sure yet",
  "Under $5,000",
  "$5,000-$15,000",
  "$15,000-$50,000",
  "$50,000+",
] as const;

/** Never shown to a real visitor; a filled value means the sender is a bot. */
export const HONEYPOT_FIELD = "website_url";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  organization: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: optionalText(50),
  website: z
    .string()
    .trim()
    .max(400)
    .refine(
      (value) =>
        value === "" ||
        /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w\-.,@?^=%&:/~+#]*)$/.test(value),
      { message: "invalid" },
    )
    .optional()
    .or(z.literal("")),
  organizationType: z.enum(ORGANIZATION_TYPES).optional().or(z.literal("")),
  interests: z.array(z.enum(INTEREST_OPTIONS)).max(INTEREST_OPTIONS.length),
  timeline: z.enum(TIMELINE_OPTIONS).optional().or(z.literal("")),
  budget: z.enum(BUDGET_OPTIONS).optional().or(z.literal("")),
  /** "Project details" in the form; stored in the Message field. */
  message: z.string().trim().min(1).max(5000),
  [HONEYPOT_FIELD]: z.string().max(0).optional().or(z.literal("")),
});

export type ContactSubmission = z.infer<typeof contactSchema>;

/** The states the form can actually be in. Nothing here implies a delivery. */
export type ContactResult =
  | { status: "ok" }
  | { status: "invalid"; fields?: string[] }
  | { status: "rate-limited" }
  | { status: "not-configured" }
  | { status: "failed" };

/** Field-level messages, so an error sits next to the input it belongs to. */
export const FIELD_ERRORS: Record<string, string> = {
  name: "Please tell us your name.",
  organization: "Please tell us your organization.",
  email: "Please enter a valid email address.",
  website: "Please enter a valid web address, or leave this blank.",
  message: "Please tell us a little about the project.",
};
