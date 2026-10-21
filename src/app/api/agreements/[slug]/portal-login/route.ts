import { NextRequest, NextResponse } from "next/server";
import { requireAgreementSession, getClientIp } from "@/lib/agreements/requestHelpers";
import { checkRateLimit } from "@/lib/rateLimit";
import { startPortalLogin } from "@/lib/portal/data/auth";
import { getPortalOrigin, sendPortalLoginEmail } from "@/lib/portal/notify";
import { isAgreementLinkedToAnEnrollment } from "@/lib/portal/data/enrollments";

/**
 * "Continue to your LWN space" on the Agreements done screen. Requests a
 * portal login code for the agreement's own participant email — resolved
 * server-side from the agreement session, never from anything the client
 * sends — and never signs anyone into the portal itself. The agreement
 * access code and the portal session remain two completely separate
 * credentials.
 */
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!checkRateLimit(req, "agreements-portal-login", { limit: 10, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const result = await requireAgreementSession(req, params.slug);
  if ("error" in result) return result.error;

  const linked = await isAgreementLinkedToAnEnrollment(result.agreement.id);
  if (!linked) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const participant = result.agreement.signers.find((s) => s.role === "participant");
  if (!participant) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");
  const loginResult = await startPortalLogin(participant.email, ip, userAgent);

  if (loginResult.person) {
    const linkUrl = `${getPortalOrigin(req)}/portal/login/link?token=${encodeURIComponent(loginResult.linkToken)}`;
    sendPortalLoginEmail({
      email: loginResult.person.email,
      isTest: loginResult.person.isTest,
      code: loginResult.code,
      linkUrl,
    }).catch((err) => console.error("[agreements/portal-login] send failed:", err));
  }

  // Same generic shape as /api/portal/auth/request-code — never reveal
  // whether an account exists from this response either.
  return NextResponse.json({ email: participant.email });
}
