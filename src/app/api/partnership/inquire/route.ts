import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { pushPartnershipInquiry } from "@/lib/airtable";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, organization, tier, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

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
