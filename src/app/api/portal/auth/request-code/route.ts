import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { startPortalLogin } from "@/lib/portal/data/auth";
import { requestCodeSchema, firstIssueMessage } from "@/lib/portal/validation";
import { getClientIp, hasValidOrigin } from "@/lib/portal/request";
import { getPortalOrigin, sendPortalLoginEmail } from "@/lib/portal/notify";

// The response is always this exact shape, whether or not the email has an
// account and whether or not it's currently throttled — never reveal which.
const GENERIC_RESPONSE = { message: "If that email has an LWN account, a code is on its way." };

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (!checkRateLimit(req, "portal-login-request", { limit: 20, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = requestCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");
  const result = await startPortalLogin(parsed.data.email, ip, userAgent);

  if (result.person) {
    const linkUrl = `${getPortalOrigin(req)}/portal/login/link?token=${encodeURIComponent(result.linkToken)}`;
    sendPortalLoginEmail({
      email: result.person.email,
      isTest: result.person.isTest,
      code: result.code,
      linkUrl,
    }).catch((err) => console.error("[portal/request-code] send failed:", err));
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
