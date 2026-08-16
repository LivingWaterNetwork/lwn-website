import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { createAdminSessionToken, isCorrectAdminPassword, YAN_ADMIN_COOKIE } from "@/lib/yanAdminAuth";

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req, "yan-admin-login", { limit: 8, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  if (!process.env.YAN_ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Admin login is not configured yet (YAN_ADMIN_PASSWORD is unset)." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isCorrectAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(YAN_ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
