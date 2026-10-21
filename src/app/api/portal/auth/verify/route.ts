import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { isPersonPrivileged, verifyPortalLoginCode } from "@/lib/portal/data/auth";
import { verifyCodeSchema, firstIssueMessage } from "@/lib/portal/validation";
import { getClientIp, hasValidOrigin } from "@/lib/portal/request";
import { createPortalSession, portalSessionCookieOptions, PORTAL_SESSION_COOKIE } from "@/lib/portal/session";

const GENERIC_ERROR = "That code didn't match. Check the email and try again.";

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (!checkRateLimit(req, "portal-login-verify", { limit: 30, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = verifyCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");
  const outcome = await verifyPortalLoginCode({ email: parsed.data.email, code: parsed.data.code, ip, userAgent });

  if (outcome.outcome === "locked") {
    return NextResponse.json({ error: "Too many incorrect codes. Please try again in 15 minutes." }, { status: 423 });
  }
  if (outcome.outcome === "rejected") {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const isPrivileged = await isPersonPrivileged(outcome.person.id);
  const { rawToken, expiresAt } = await createPortalSession({
    personId: outcome.person.id,
    isPrivileged,
    ip,
    userAgent,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set(PORTAL_SESSION_COOKIE, rawToken, portalSessionCookieOptions(expiresAt));
  return res;
}
