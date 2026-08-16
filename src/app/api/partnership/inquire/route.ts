import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { pushPartnershipInquiry } from "@/lib/airtable";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, isHoneypotTripped, partnershipInquirySchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "partnership-inquire")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ success: true });
    }

    const parsed = partnershipInquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { name, email, phone, organization, tier, message } = parsed.data;

    const record = await prisma.partnershipInquiry.create({
      data: { name, email, phone, organization, tier, message },
    });

    try {
      await pushPartnershipInquiry({ name, email, phone, organization, tier, message });
    } catch (err) {
      console.error("[partnership/inquire/route] Airtable sync failed:", err);
    }

    try {
      await sendNotificationEmail({
        subject: `New Partnership Inquiry — ${name}${tier ? ` (${tier})` : ""}`,
        text: `
New partnership inquiry received:

Name: ${name}
Email: ${email}
Phone: ${phone ?? "—"}
Organization: ${organization ?? "—"}
Tier of interest: ${tier ?? "Not specified"}

Message:
${message ?? "—"}

→ View in Airtable to manage follow-up.
        `.trim(),
      });
    } catch (err) {
      console.error("[partnership/inquire/route] Email notification failed:", err);
    }

    return NextResponse.json({ success: true, id: record.id });
  } catch (err) {
    console.error("[partnership/inquire/route]", err);
    return NextResponse.json({ error: "Failed to submit inquiry." }, { status: 500 });
  }
}
