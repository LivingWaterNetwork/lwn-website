import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { pushProgramInquiry } from "@/lib/airtable";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, isHoneypotTripped, programInquirySchema } from "@/lib/validation";

const PROGRAM_LABELS: Record<string, string> = {
  counseling: "Personalized Counseling",
  mentorship: "Strategic Mentorship",
  speaking: "Public Speaking Engagement",
  missions: "International Mission Trip",
  coaching: "Personal Coaching",
  "church-advisory": "Church Advisory Services",
};

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "programs-inquire")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ success: true });
    }

    const parsed = programInquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { program, name, email, phone, details } = parsed.data;

    const inquiry = await prisma.programInquiry.create({
      data: { program, name, email, phone, details },
    });

    // Push to Airtable — awaited so errors appear in Vercel function logs
    try {
      await pushProgramInquiry({ name, email, phone, program: PROGRAM_LABELS[program] ?? program, details });
      console.log("[programs/inquire/route] Airtable record created successfully");
    } catch (err) {
      console.error("[programs/inquire/route] Airtable sync failed:", err);
    }

    // Send notification email — awaited so errors appear in Vercel function logs
    try {
      await sendNotificationEmail({
        subject: `New ${PROGRAM_LABELS[program] ?? program} Inquiry — ${name}`,
        text: `
New program inquiry received:

Program: ${PROGRAM_LABELS[program] ?? program}
Name: ${name}
Email: ${email}
Phone: ${phone ?? "—"}

Details:
${details}

→ View in Airtable to manage follow-up status.
        `.trim(),
      });
      console.log("[programs/inquire/route] Notification email sent successfully");
    } catch (err) {
      console.error("[programs/inquire/route] Email notification failed:", err);
    }

    return NextResponse.json({ success: true, id: inquiry.id });
  } catch (err) {
    console.error("[programs/inquire/route]", err);
    return NextResponse.json({ error: "Failed to submit inquiry." }, { status: 500 });
  }
}
