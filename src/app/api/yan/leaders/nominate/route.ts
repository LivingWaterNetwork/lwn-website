import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, isHoneypotTripped, yanLeaderNominationSchema } from "@/lib/yanValidation";

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "yan-leaders-nominate")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) return NextResponse.json({ success: true });

    const parsed = yanLeaderNominationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { name, ministryName, role, bio, nominatedByName, nominatedByEmail, consentGiven, city } = parsed.data;

    const baseSlug = slugify(name) || "leader";
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.yanLeader.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++suffix}`;
    }

    const leader = await prisma.yanLeader.create({
      data: {
        name,
        slug,
        role: role || null,
        ministryName: ministryName || null,
        bio,
        city: city || "Atlanta",
        consentGiven: Boolean(consentGiven),
        submittedByEmail: nominatedByEmail,
        status: "pending",
      },
    });

    try {
      await sendNotificationEmail({
        subject: `YAN: New leader nomination — ${name}`,
        text: `
New leader/ministry nomination for spotlight review:

Leader: ${name}${role ? ` (${role})` : ""}${ministryName ? ` — ${ministryName}` : ""}
City: ${city || "Atlanta"}
Nominated by: ${nominatedByName} (${nominatedByEmail})
Consent confirmed by nominator: ${consentGiven ? "yes" : "no"}

Bio:
${bio}

→ Confirm direct consent from the leader before publishing (/yan/admin/leaders).
        `.trim(),
      });
    } catch (err) {
      console.error("[api/yan/leaders/nominate] notification email failed:", err);
    }

    return NextResponse.json({ success: true, id: leader.id });
  } catch (err) {
    console.error("[api/yan/leaders/nominate]", err);
    return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
  }
}
