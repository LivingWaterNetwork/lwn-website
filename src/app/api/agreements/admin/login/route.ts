import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  createAgreementsAdminSessionToken,
  isAgreementsAdminPasswordConfigured,
  isCorrectAgreementsAdminPassword,
  AGREEMENTS_ADMIN_COOKIE,
} from "@/lib/agreements/adminAuth";
import { adminLoginSchema, firstIssueMessage } from "@/lib/agreements/validation";

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req, "agreements-admin-login", { limit: 8, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  if (!isAgreementsAdminPasswordConfigured()) {
    return NextResponse.json(
      { error: "AGREEMENTS_ADMIN_PASSWORD is not set in Vercel yet. Ask Omar to set it, then try again." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  if (!isCorrectAgreementsAdminPassword(parsed.data.password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createAgreementsAdminSessionToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(AGREEMENTS_ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
