import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { pushMultiYearPledgeInquiry } from "@/lib/airtable";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, organization, pledgeLength, estimatedAnnual, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

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
