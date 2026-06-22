import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";

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

    await sendNotificationEmail({
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

View all applications: ${process.env.NEXT_PUBLIC_SITE_URL}/api/admin (DB)
      `.trim(),
    });

    return NextResponse.json({ success: true, id: application.id });
  } catch (err) {
    console.error("[cohort/route]", err);
    return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
  }
}
