import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, isHoneypotTripped, yanResourceSubmissionSchema } from "@/lib/yanValidation";

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "yan-resources-submit")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) return NextResponse.json({ success: true });

    const parsed = yanResourceSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { name, email, title, resourceType, description, externalUrl } = parsed.data;

    const baseSlug = slugify(title) || "resource";
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.yanResource.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++suffix}`;
    }

    const resource = await prisma.yanResource.create({
      data: { title, slug, resourceType, description, externalUrl: externalUrl || null, submittedByEmail: email, status: "pending" },
    });

    try {
      await sendNotificationEmail({
        subject: `YAN: New resource submission — ${title}`,
        text: `
New resource submitted for review:

Title: ${title}
Type: ${resourceType}
Submitted by: ${name} (${email})
Link: ${externalUrl || "—"}

Description:
${description}

→ Review and publish in the YAN admin (/yan/admin/resources).
        `.trim(),
      });
    } catch (err) {
      console.error("[api/yan/resources/submit] notification email failed:", err);
    }

    return NextResponse.json({ success: true, id: resource.id });
  } catch (err) {
    console.error("[api/yan/resources/submit]", err);
    return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
  }
}
