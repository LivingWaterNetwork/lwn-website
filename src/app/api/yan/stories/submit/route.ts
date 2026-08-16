import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendYanNotificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, isHoneypotTripped, yanStorySubmissionSchema } from "@/lib/yanValidation";

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "yan-stories-submit")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) return NextResponse.json({ success: true });

    const parsed = yanStorySubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { name, email, title, storyType, body: storyBody, consentGiven, city } = parsed.data;

    const baseSlug = slugify(title) || "story";
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.yanStory.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++suffix}`;
    }

    const story = await prisma.yanStory.create({
      data: {
        title,
        slug,
        storyType,
        body: storyBody,
        authorName: name,
        city: city || "Atlanta",
        consentGiven: Boolean(consentGiven),
        submittedByEmail: email,
        status: "pending",
      },
    });

    try {
      await sendYanNotificationEmail({
        subject: `YAN: New story submission — ${title}`,
        text: `
New story submitted for review:

Title: ${title}
Type: ${storyType}
City: ${city || "Atlanta"}
Submitted by: ${name} (${email})
Consent to publish: ${consentGiven ? "yes" : "no"}

→ Review and publish in the YAN admin (/yan/admin/stories).
        `.trim(),
      });
    } catch (err) {
      console.error("[api/yan/stories/submit] notification email failed:", err);
    }

    return NextResponse.json({ success: true, id: story.id });
  } catch (err) {
    console.error("[api/yan/stories/submit]", err);
    return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
  }
}
