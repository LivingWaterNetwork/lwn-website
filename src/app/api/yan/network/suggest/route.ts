import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, isHoneypotTripped, yanGroupSuggestionSchema } from "@/lib/yanValidation";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "yan-network-suggest")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) return NextResponse.json({ success: true });

    const parsed = yanGroupSuggestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { name, email, groupName, neighborhood, meetingDay, meetingFrequency, gatheringType, websiteUrl, instagramHandle, description } =
      parsed.data;

    const baseSlug = slugify(groupName) || "group";
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.yanGroup.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++suffix}`;
    }

    // Always created in "pending" — never auto-published to the public directory.
    const group = await prisma.yanGroup.create({
      data: {
        name: groupName,
        slug,
        description,
        neighborhood: neighborhood || null,
        meetingDay: meetingDay || null,
        meetingFrequency: meetingFrequency || null,
        gatheringType: gatheringType || null,
        websiteUrl: websiteUrl || null,
        instagramHandle: instagramHandle || null,
        leaderName: name,
        contactEmail: email,
        submittedByEmail: email,
        status: "pending",
      },
    });

    try {
      await sendNotificationEmail({
        subject: `YAN: New group submission — ${groupName}`,
        text: `
New group/ministry submitted for the YAN network directory:

Group: ${groupName}
Submitted by: ${name} (${email})
Neighborhood: ${neighborhood || "—"}
Meeting: ${meetingDay || "—"} · ${meetingFrequency || "—"}
Website: ${websiteUrl || "—"}
Instagram: ${instagramHandle || "—"}

Description:
${description}

→ Review and publish in the YAN admin (/yan/admin/groups).
        `.trim(),
      });
    } catch (err) {
      console.error("[api/yan/network/suggest] notification email failed:", err);
    }

    return NextResponse.json({ success: true, id: group.id });
  } catch (err) {
    console.error("[api/yan/network/suggest]", err);
    return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
  }
}
