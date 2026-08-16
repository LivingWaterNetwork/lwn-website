import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { pushContactSubmission } from "@/lib/airtable";
import { checkRateLimit } from "@/lib/rateLimit";
import { contactSchema, firstIssueMessage, isHoneypotTripped } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "contact")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ success: true });
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { name, email, message, subject } = parsed.data;

    const inquiryLabel = typeof subject === "string" && subject.trim() ? subject.trim() : null;

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
        subject: inquiryLabel ? `${inquiryLabel} — ${name}` : `New Contact Message — ${name}`,
        text: `
New contact form submission${inquiryLabel ? ` (${inquiryLabel})` : ""}:

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
