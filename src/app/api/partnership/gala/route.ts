import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { pushGalaSponsorshipInquiry } from "@/lib/airtable";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, galaSponsorshipSchema, isHoneypotTripped } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "partnership-gala")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ success: true });
    }

    const parsed = galaSponsorshipSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { name, email, phone, organization, sponsorshipLevel, ticketCount, message } = parsed.data;

    const record = await prisma.galaSponsorshipInquiry.create({
      data: { name, email, phone, organization, sponsorshipLevel, ticketCount, message },
    });

    try {
      await pushGalaSponsorshipInquiry({ name, email, phone, organization, sponsorshipLevel, ticketCount, message });
    } catch (err) {
      console.error("[partnership/gala/route] Airtable sync failed:", err);
    }

    try {
      await sendNotificationEmail({
        subject: `Gala Sponsorship Inquiry — ${name} (${sponsorshipLevel ?? "level TBD"})`,
        text: `
New Gala sponsorship inquiry received:

Name: ${name}
Email: ${email}
Phone: ${phone ?? "—"}
Organization: ${organization ?? "—"}
Sponsorship level: ${sponsorshipLevel ?? "—"}
Ticket count: ${ticketCount ?? "—"}

Message:
${message ?? "—"}

→ View in Airtable to manage follow-up.
        `.trim(),
      });
    } catch (err) {
      console.error("[partnership/gala/route] Email notification failed:", err);
    }

    return NextResponse.json({ success: true, id: record.id });
  } catch (err) {
    console.error("[partnership/gala/route]", err);
    return NextResponse.json({ error: "Failed to submit inquiry." }, { status: 500 });
  }
}
