import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendYanNotificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, isHoneypotTripped, yanPrayerRequestSchema } from "@/lib/yanValidation";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "yan-prayer-request")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) return NextResponse.json({ success: true });

    const parsed = yanPrayerRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { requestText, name, email, city, visibility, allowFollowUp } = parsed.data;

    // Every submission starts private/unpublished — moderation must explicitly
    // change status before an anonymized version can ever appear on /yan/pray.
    // City is stored (if provided) purely so admin can see where a request came
    // from — prayer requests are never city-gated the way directory content is.
    const request = await prisma.yanPrayerRequest.create({
      data: { requestText, name: name || null, email: email || null, city: city || null, visibility, allowFollowUp, status: "new" },
    });

    // Notification is sent to the internal team inbox only — never logged to
    // the console, and the request body/prayer text itself is never echoed
    // back in the API response or in error logs below.
    try {
      await sendYanNotificationEmail({
        subject: `YAN: New prayer request (${visibility})`,
        text: `
A new prayer request was submitted on /yan/pray.

Visibility requested: ${visibility}
Follow-up permitted: ${allowFollowUp ? "yes" : "no"}
City: ${city || "(not shared)"}
Name: ${name || "(not shared)"}
Email: ${email || "(not shared)"}

Request:
${requestText}

→ Review and moderate in the YAN admin before any public/anonymized version is shown.
        `.trim(),
      });
    } catch (err) {
      console.error("[api/yan/pray/request] notification email failed (no prayer content in this log).");
      void err;
    }

    return NextResponse.json({ success: true, id: request.id });
  } catch (err) {
    console.error("[api/yan/pray/request] submission failed (no prayer content in this log).");
    void err;
    return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
  }
}
