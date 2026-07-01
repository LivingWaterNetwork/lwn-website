import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { pushCohortApplication } from "@/lib/airtable";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, city, state, role, ministry, whyJoin, referral } = body;

    if (!name || !email || !whyJoin) {
      return NextResponse.json(
        { error: "Name, email, and reason for joining are required." },
        { status: 400 }
      );
    }

    const application = await prisma.cohortApplication.create({
      data: { name, email, phone, city, state, role, ministry, whyJoin, referral },
    });

    // Push to Airtable for pipeline management (fire-and-forget — don't fail the request)
    pushCohortApplication({ name, email, phone, city, state, role, ministry, whyJoin, referral })
      .catch((err) => console.error("[cohort/route] Airtable sync failed:", err));

    // Send notification email (fire-and-forget — don't fail the request if email errors)
    sendNotificationEmail({
      subject: `New Cohort Application — ${name}`,
      text: `
New cohort application received:

Name: ${name}
Email: ${email}
Phone: ${phone ?? "—"}
City/State: ${city ?? "—"}, ${state ?? "—"}
Role: ${role ?? "—"}
Ministry/Org: ${ministry ?? "—"}
Referral: ${referral ?? "—"}

Why they want to join:
${whyJoin}

→ View in Airtable to manage pipeline status.
      `.trim(),
    }).catch((err) => console.error("[cohort/route] Email notification failed:", err));

    return NextResponse.json({ success: true, id: application.id });
  } catch (err) {
    console.error("[cohort/route]", err);
    return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
  }
}
