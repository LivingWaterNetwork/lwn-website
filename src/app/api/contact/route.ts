import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { pushContactSubmission } from "@/lib/airtable";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const submission = await prisma.contactSubmission.create({
      data: { name, email, message },
    });

    // Push to Airtable — awaited so errors appear in Vercel function logs
    try {
      await pushContactSubmission({ name, email, message });
      console.log("[contact/route] Airtable record created successfully");
    } catch (err) {
      console.error("[contact/route] Airtable sync failed:", err);
    }

    // Send notification email — awaited so errors appear in Vercel function logs
    try {
      await sendNotificationEmail({
        subject: `New Contact Message — ${name}`,
        text: `
New contact form submission:

Name: ${name}
Email: ${email}

Message:
${message}

→ View in Airtable to track follow-up status.
        `.trim(),
      });
      console.log("[contact/route] Notification email sent successfully");
    } catch (err) {
      console.error("[contact/route] Email notification failed:", err);
    }

    return NextResponse.json({ success: true, id: submission.id });
  } catch (err) {
    console.error("[contact/route]", err);
    return NextResponse.json({ error: "Failed to submit message." }, { status: 500 });
  }
}
