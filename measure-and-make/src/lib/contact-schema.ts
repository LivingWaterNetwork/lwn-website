import { z } from "zod";

// Field list is exactly the one specified in 02-WEBSITE-COPY.md (Contact page).
// Shared by the client form and the server route so the two cannot drift, but
// the server validates independently — client-side validation is never trusted.

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

/** Never shown to a real visitor; a filled value means the sender is a bot. */
export const HONEYPOT_FIELD = "website_url";

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  organization: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  organizationType: z.enum(ORGANIZATION_TYPES).optional().or(z.literal("")),
  interests: z.array(z.enum(INTEREST_OPTIONS)).max(INTEREST_OPTIONS.length),
  message: z.string().trim().max(5000).optional().or(z.literal("")),
  [HONEYPOT_FIELD]: z.string().max(0).optional().or(z.literal("")),
});

export type ContactSubmission = z.infer<typeof contactSchema>;

/** Discriminated result the client renders directly — no invented states. */
export type ContactResult =
  | { status: "ok" }
  | { status: "invalid"; fields?: string[] }
  | { status: "rate-limited" }
  | { status: "not-configured" }
  | { status: "failed" };
