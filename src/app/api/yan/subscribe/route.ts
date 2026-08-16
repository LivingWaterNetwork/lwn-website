import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, isHoneypotTripped, yanSubscribeSchema } from "@/lib/yanValidation";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "yan-subscribe")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    if (isHoneypotTripped(body)) return NextResponse.json({ success: true });

    const parsed = yanSubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { email, firstName, interests } = parsed.data;

    await prisma.yanSubscriber.upsert({
      where: { email },
      update: { firstName: firstName || undefined, interests: interests || undefined },
      create: { email, firstName: firstName || null, interests: interests || null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/yan/subscribe]", err);
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}
