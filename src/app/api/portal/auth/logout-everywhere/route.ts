import { NextRequest, NextResponse } from "next/server";
import { hasValidOrigin } from "@/lib/portal/request";
import { PORTAL_SESSION_COOKIE, resolvePortalSession, revokeAllPortalSessionsForPerson } from "@/lib/portal/session";

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const rawToken = req.cookies.get(PORTAL_SESSION_COOKIE)?.value;
  const session = await resolvePortalSession(rawToken);
  if (session) {
    await revokeAllPortalSessionsForPerson(session.personId);
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(PORTAL_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
