import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { pushMultiYearPledgeInquiry } from "@/lib/airtable";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, isHoneypotTripped, partnershipPledgeSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "partnership-pledge")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ success: true });
    }

    const parsed = partnershipPledgeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { name, email, phone, organization, pledgeLength, estimatedAnnual, message } = parsed.data;

    const record = await prisma.multiYearPledgeInquiry.create({
      data: { name, email, phone, organization, pledgeLength, estimatedAnnual, message },
    });

    try {
      await pushMultiYearPledgeInquiry({ name, email, phone, organization, pledgeLength, estimatedAnnual, message });
    } catch (err) {
      console.error("[partnership/pledge/route] Airtable sync failed:", err);
    }

    try {
      await sendNotificationEmail({
        subject: `Multi-Year Pledge Inquiry — ${name} (${pledgeLength ?? "length TBD"})`,
        text: `
A multi-year pledge inquiry was received — this is a significant commitment, worth a fast follow-up:

Name: ${name}
Email: ${email}
Phone: ${phone ?? "—"}
Organization: ${organization ?? "—"}
Pledge length: ${pledgeLength ?? "—"}
Estimated annual commitment: ${estimatedAnnual ?? "—"}

Message:
${message ?? "—"}

→ View in Airtable to manage follow-up.
        `.trim(),
      });
    } catch (err) {
      console.error("[partnership/pledge/route] Email notification failed:", err);
    }

    return NextResponse.json({ success: true, id: record.id });
  } catch (err) {
    console.error("[partnership/pledge/route]", err);
    return NextResponse.json({ error: "Failed to submit inquiry." }, { status: 500 });
  }
}
