import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, isHoneypotTripped, yanJoinSchema } from "@/lib/yanValidation";

const PATHWAY_LABELS: Record<string, string> = {
  "ministry-leader": "Ministry/group leader joining the network",
  pastor: "Pastor or church leader exploring partnership",
  "roundtable-interest": "Leaders Roundtable interest",
  "find-community": "Young adult looking for a local community",
  "partner-volunteer": "Resource, volunteer, or collaboration partner",
  updates: "General launch updates",
};

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "yan-join")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) return NextResponse.json({ success: true });

    const parsed = yanJoinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { pathway, name, email, phone, ministryName, city, role, message } = parsed.data;

    const submission = await prisma.yanJoinSubmission.create({
      data: { pathway, name, email, phone, ministryName, city, role, message },
    });

    try {
      await sendNotificationEmail({
        subject: `YAN: New ${PATHWAY_LABELS[pathway] ?? pathway} — ${name}`,
        text: `
New YAN join-the-network submission:

Pathway: ${PATHWAY_LABELS[pathway] ?? pathway}
Name: ${name}
Email: ${email}
Phone: ${phone || "—"}
Ministry: ${ministryName || "—"}
City: ${city || "—"}
Role: ${role || "—"}

Message:
${message || "—"}
        `.trim(),
      });
    } catch (err) {
      console.error("[api/yan/join] notification email failed:", err);
    }

    return NextResponse.json({ success: true, id: submission.id });
  } catch (err) {
    console.error("[api/yan/join]", err);
    return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
  }
}
