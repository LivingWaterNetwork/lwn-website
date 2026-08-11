import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { pushProgramInquiry } from "@/lib/airtable";

const VALID_PROGRAMS = ["counseling", "mentorship", "speaking", "missions", "coaching", "church-advisory"];

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
    const body = await req.json();
    const { program, name, email, phone, details } = body;

    if (!program || !VALID_PROGRAMS.includes(program)) {
      return NextResponse.json(
        { error: "A valid program is required." },
        { status: 400 }
      );
    }

    if (!name || !email || !details) {
      return NextResponse.json(
        { error: "Name, email, and details are required." },
        { status: 400 }
      );
    }

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
