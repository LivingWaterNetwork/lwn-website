import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";

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

    await sendNotificationEmail({
      subject: `New Contact Message — ${name}`,
      text: `
New contact form submission:

Name: ${name}
Email: ${email}

Message:
${message}
      `.trim(),
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (err) {
    console.error("[contact/route]", err);
    return NextResponse.json({ error: "Failed to submit message." }, { status: 500 });
  }
}
