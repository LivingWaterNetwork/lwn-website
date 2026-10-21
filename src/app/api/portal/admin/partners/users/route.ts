import { NextRequest, NextResponse } from "next/server";
import { getPortalActor } from "@/lib/portal/auth";
import { addPartnerUserForAdmin } from "@/lib/portal/data/partners";
import { addPartnerUserSchema, firstIssueMessage } from "@/lib/portal/adminValidation";
import { hasValidOrigin } from "@/lib/portal/request";

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor?.isAdmin) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = addPartnerUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });

  const user = await addPartnerUserForAdmin(actor, parsed.data);
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ user });
}
