import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDiscoveryNotificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, isHoneypotTripped, businessStewardshipDiscoverySchema } from "@/lib/validation";
import { buildDiscoveryExecutiveSummary } from "@/lib/discoverySummary";

const ANSWER_LABELS: Record<string, string> = {
  otherServices: "Other services beyond estate cleanouts & junk removal",
  otherPartnerships: "Other relationships currently sending work",
  replicatePartnershipTypes: "Types of orgs/businesses to replicate partnerships with",
  estateJobsPerWeek: "Estate-sale referral — jobs/week",
  estateJobValue: "Estate-sale referral — value/job",
  foreclosureJobsPerMonth: "Foreclosure referral — jobs/month",
  foreclosureJobValue: "Foreclosure referral — value/job",
  hasWebsite: "Has a website",
  googlePresence: "Established on Google",
  growthMotivation: "Primary growth motivation",
  teamDependents: "People depending on the business for work",
  employeeCount: "Employees",
  contractorCount: "Contractors",
  primaryRoles: "Primary roles",
  employmentType: "Full-time / part-time / as-needed",
  consistentWorkTarget: "What \"consistent\" would ideally look like",
  currentUtilizationDays: "Current crew days/week",
  capacityCeiling: "Capacity for additional work right now",
  capacityExplanation: "Capacity explanation",
  hiringThreshold: "Hiring threshold",
  priorityNext90Days: "Top priority for next 90 days",
  priorityRanking: "Priority ranking (if combination)",
  partnershipComfort: "Comfort with current referral concentration",
  partnershipRiskImpact: "Impact if a referral relationship stopped",
  idealJobsPerWeek: "Ideal jobs/week (90 days out)",
  idealCrewDaysPerWeek: "Ideal crew workdays/week (90 days out)",
  idealAvgJobValue: "Ideal average job value (90 days out)",
  idealReferralChannels: "Ideal number of reliable referral channels",
  wouldAddEmployees: "Would expect to add employees",
  ninetyDayVision: "\"This worked\" — 90 days from now",
};

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "discovery", { limit: 10, windowMs: 10 * 60 * 1000 })) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ success: true });
    }

    const parsed = businessStewardshipDiscoverySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { clientSlug, name, email, phone, answers } = parsed.data;

    const submission = await prisma.businessStewardshipDiscovery.create({
      data: { clientSlug, name, email, phone, answers },
    });

    const executiveSummary = buildDiscoveryExecutiveSummary(answers);

    const answersText = Object.entries(answers)
      .filter(([, value]) => value && value.trim().length > 0)
      .map(([key, value]) => `${ANSWER_LABELS[key] ?? key}:\n${value}`)
      .join("\n\n");

    try {
      await sendDiscoveryNotificationEmail({
        subject: `New Business Stewardship Discovery — ${name}`,
        text: `
New Business Stewardship Discovery submission (${clientSlug}):

Name: ${name}
Email: ${email}
Phone: ${phone ?? "—"}

${executiveSummary}

────────────────────────
FULL ANSWERS
────────────────────────

${answersText}
        `.trim(),
      });
    } catch (err) {
      console.error("[discovery/route] Email notification failed:", err);
    }

    return NextResponse.json({ success: true, id: submission.id });
  } catch (err) {
    console.error("[discovery/route]", err);
    return NextResponse.json({ error: "Failed to submit discovery." }, { status: 500 });
  }
}
