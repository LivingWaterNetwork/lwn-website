import { z } from "zod";

/** Hidden honeypot field name shared by every public form. Real visitors never fill it in. */
export const HONEYPOT_FIELD = "website";

const name = z.string().trim().min(1, "Name is required.").max(200);
const email = z.string().trim().min(1, "Email is required.").email("Please enter a valid email.").max(320);
const optionalPhone = z.string().trim().max(40).optional().or(z.literal(""));
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const cohortApplicationSchema = z.object({
  name,
  email,
  phone: optionalPhone,
  city: optionalText(120),
  state: optionalText(60),
  role: optionalText(120),
  ministry: optionalText(200),
  whyJoin: z.string().trim().min(1, "Please share why you want to join.").max(5000),
  referral: optionalText(200),
});

export const contactSchema = z.object({
  name,
  email,
  message: z.string().trim().min(1, "Message is required.").max(5000),
  subject: optionalText(200),
});

export const programInquirySchema = z.object({
  program: z.enum(["counseling", "mentorship", "speaking", "missions", "coaching", "church-advisory"]),
  name,
  email,
  phone: optionalPhone,
  details: z.string().trim().min(1, "Please share some details.").max(5000),
});

export const partnershipInquirySchema = z.object({
  name,
  email,
  phone: optionalPhone,
  organization: optionalText(200),
  tier: optionalText(80),
  message: optionalText(5000),
});

export const partnershipPledgeSchema = z.object({
  name,
  email,
  phone: optionalPhone,
  organization: optionalText(200),
  pledgeLength: optionalText(40),
  estimatedAnnual: optionalText(60),
  message: optionalText(5000),
});

export const galaSponsorshipSchema = z.object({
  name,
  email,
  phone: optionalPhone,
  organization: optionalText(200),
  sponsorshipLevel: optionalText(80),
  ticketCount: optionalText(20),
  message: optionalText(5000),
});

export const businessStewardshipDiscoverySchema = z.object({
  clientSlug: z.string().trim().min(1).max(60).default("dante"),
  name,
  email,
  phone: optionalPhone,
  answers: z.object({
    otherServices: optionalText(1000),
    otherPartnerships: optionalText(1000),
    replicatePartnershipTypes: optionalText(1000),
    estateJobsPerWeek: optionalText(60),
    estateJobValue: optionalText(60),
    foreclosureJobsPerMonth: optionalText(60),
    foreclosureJobValue: optionalText(60),
    hasWebsite: optionalText(20),
    googlePresence: optionalText(60),
    growthMotivation: optionalText(1000),
    teamDependents: optionalText(30),
    employeeCount: optionalText(20),
    contractorCount: optionalText(20),
    primaryRoles: optionalText(500),
    employmentType: optionalText(200),
    consistentWorkTarget: optionalText(1000),
    currentUtilizationDays: optionalText(60),
    capacityCeiling: optionalText(80),
    capacityExplanation: optionalText(1000),
    hiringThreshold: optionalText(500),
    priorityNext90Days: optionalText(80),
    priorityRanking: optionalText(300),
    partnershipComfort: optionalText(80),
    partnershipRiskImpact: optionalText(1000),
    idealJobsPerWeek: optionalText(30),
    idealCrewDaysPerWeek: optionalText(30),
    idealAvgJobValue: optionalText(60),
    idealReferralChannels: optionalText(30),
    wouldAddEmployees: optionalText(20),
    ninetyDayVision: z.string().trim().min(1, "Please share your vision for the business.").max(5000),
  }),
});

export const newsletterSchema = z.object({
  email,
  firstName: optionalText(120),
});

export const donateSchema = z.object({
  amount: z.number().int().min(100, "Minimum donation is $1.").max(100_000_000),
  frequency: z.enum(["one-time", "monthly", "yearly"]).default("one-time"),
  name: optionalText(200),
  email,
  comment: optionalText(100),
});

/** Returns true if the honeypot field is non-empty — i.e. filled in by a bot. */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  const value = body[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim().length > 0;
}

/** Formats the first Zod issue into a short, user-facing message. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid submission.";
}
