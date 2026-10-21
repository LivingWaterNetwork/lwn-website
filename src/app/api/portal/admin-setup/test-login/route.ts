import { NextRequest, NextResponse } from "next/server";
import { startPortalLogin } from "@/lib/portal/data/auth";
import { bootstrapFindPersonByEmail } from "@/lib/portal/data/persons";
import { getPortalOrigin } from "@/lib/portal/notify";

/**
 * TEMPORARY — mints a fresh sign-in code for the test member account created
 * by /api/portal/admin-setup, for Omar's PR #18 preview review. Refuses any
 * person who isn't is_test, same rule as scripts/portal-test-login.ts.
 * Removed once the review is done.
 */
const SETUP_KEY = "94a775d6a3a5b4582db287fa850fca8baf1dd7501ad50fa4";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-setup-key") !== SETUP_KEY) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}) as { email?: string });
  const email = body.email ?? "test-member-a@example.com";

  const person = await bootstrapFindPersonByEmail(email);
  if (!person) return NextResponse.json({ error: `No portal_persons row for ${email}.` }, { status: 404 });
  if (!person.isTest) {
    return NextResponse.json({ error: `${email} is not a test record — refusing.` }, { status: 400 });
  }

  const result = await startPortalLogin(email, null, "admin-setup/test-login route");
  if (!result.person) {
    return NextResponse.json({ error: "Throttled — try again shortly." }, { status: 429 });
  }

  const linkUrl = `${getPortalOrigin(req)}/portal/login/link?token=${encodeURIComponent(result.linkToken)}`;
  return NextResponse.json({ email, code: result.code, linkUrl, expiresInMinutes: 10 });
}
