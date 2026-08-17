import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  createDiscoverySessionToken,
  isCorrectDiscoveryAccessCode,
  DANTE_DISCOVERY_COOKIE,
} from "@/lib/danteDiscoveryAuth";

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req, "dante-discovery-login", { limit: 8, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  if (!process.env.DANTE_DISCOVERY_ACCESS_CODE) {
    return NextResponse.json(
      { error: "This link isn't set up yet (DANTE_DISCOVERY_ACCESS_CODE is unset)." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";

  if (!isCorrectDiscoveryAccessCode(code)) {
    return NextResponse.json({ error: "That code doesn't match." }, { status: 401 });
  }

  const token = await createDiscoverySessionToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(DANTE_DISCOVERY_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
