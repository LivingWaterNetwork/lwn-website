import { NextRequest, NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/kit";
import { checkRateLimit } from "@/lib/rateLimit";
import { firstIssueMessage, newsletterSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(req, "newsletter")) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    }
    const { email, firstName } = parsed.data;

    await subscribeToNewsletter(email, firstName);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[newsletter/route] Newsletter signup failed:", message);
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}
