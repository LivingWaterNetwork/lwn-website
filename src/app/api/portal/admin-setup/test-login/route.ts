import { NextRequest, NextResponse } from "next/server";
import { startPortalLogin } from "@/lib/portal/data/auth";
import { bootstrapFindPersonByEmail } from "@/lib/portal/data/persons";
import { getPortalOrigin } from "@/lib/portal/notify";

/**
 * TEMPORARY — mints a fresh sign-in code without sending email, for Omar's
 * PR #18 preview review. Refuses any person who isn't is_test EXCEPT Omar's
 * own address (preview email delivery via the Resend shared domain/Graph
 * fallback is unreliable right now — this is a same-secret-gated bypass of
 * that delivery path for his own review login, not a new real-recipient
 * email bypass: nothing is sent, it just hands back what the email would
 * have contained). Removed once the review is done.
 */
const SETUP_KEY = "94a775d6a3a5b4582db287fa850fca8baf1dd7501ad50fa4";
const OMAR_EMAIL = "ofandino@lwnetwork.org";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-setup-key") !== SETUP_KEY) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}) as { email?: string });
  const email = body.email ?? "test-member-a@example.com";

  const person = await bootstrapFindPersonByEmail(email);
  if (!person) return NextResponse.json({ error: `No portal_persons row for ${email}.` }, { status: 404 });
  if (!person.isTest && email.toLowerCase() !== OMAR_EMAIL) {
    return NextResponse.json({ error: `${email} is not a test record — refusing.` }, { status: 400 });
  }

  const result = await startPortalLogin(email, null, "admin-setup/test-login route");
  if (!result.person) {
    return NextResponse.json({ error: "Throttled — try again shortly." }, { status: 429 });
  }

  const linkUrl = `${getPortalOrigin(req)}/portal/login/link?token=${encodeURIComponent(result.linkToken)}`;
  return NextResponse.json({ email, code: result.code, linkUrl, expiresInMinutes: 10 });
}
