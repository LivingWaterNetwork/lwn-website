import { NextRequest, NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/kit";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    await subscribeToNewsletter(email, firstName);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[newsletter/route]", err);
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}
