import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { pushCatalystInquiry } from "@/lib/airtable";
import { checkRateLimit } from "@/lib/rateLimit";
import { catalystInquirySchema, firstIssueMessage, isHoneypotTripped } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "catalyst-inquire")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) {
      // Silently accept so a bot can't distinguish a rejection from a success.
      return NextResponse.json({ success: true });
    }

    const parsed = catalystInquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }

    const {
      name,
      email,
      phone,
      organization,
      currentWebsite,
      orgType,
      building,
      problem,
      services,
      projectStage,
      timeline,
      budgetRange,
      referral,
      additional,
    } = parsed.data;

    const inquiry = await prisma.catalystInquiry.create({
      data: {
        name,
        email,
        phone,
        organization,
        currentWebsite,
        orgType,
        building,
        problem,
        services,
        projectStage,
        timeline,
        budgetRange,
        referral,
        additional,
      },
    });

    // Push to Airtable — awaited so errors appear in Vercel function logs.
    // The "Catalyst Inquiries" table still has to be created in the base; until
    // it is, this throws and is logged here without failing the submission.
    try {
      await pushCatalystInquiry({
        name,
        email,
        phone,
        organization,
        currentWebsite,
        orgType,
        building,
        problem,
        services,
        projectStage,
        timeline,
        budgetRange,
        referral,
        additional,
      });
      console.log("[catalyst/inquire/route] Airtable record created successfully");
    } catch (err) {
      console.error("[catalyst/inquire/route] Airtable sync failed:", err);
    }

    // Send notification email — awaited so errors appear in Vercel function logs
    try {
      await sendNotificationEmail({
        subject: `New Catalyst Inquiry — ${name}${organization ? ` (${organization})` : ""}`,
        text: `
New Living Water Catalyst inquiry received:

Name: ${name}
Email: ${email}
Phone: ${phone || "—"}
Organization: ${organization || "—"}
Current website: ${currentWebsite || "—"}
Organization type: ${orgType || "—"}

What they're building:
${building}

The problem they're trying to solve:
${problem || "—"}

Services of interest: ${services || "—"}
Project stage: ${projectStage || "—"}
Timeline: ${timeline || "—"}
Budget range: ${budgetRange || "—"}
How they heard about us: ${referral || "—"}

Additional context:
${additional || "—"}
        `.trim(),
      });
      console.log("[catalyst/inquire/route] Notification email sent successfully");
    } catch (err) {
      console.error("[catalyst/inquire/route] Email notification failed:", err);
    }

    return NextResponse.json({ success: true, id: inquiry.id });
  } catch (err) {
    console.error("[catalyst/inquire/route]", err);
    return NextResponse.json({ error: "Failed to submit inquiry." }, { status: 500 });
  }
}
