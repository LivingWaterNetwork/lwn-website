import { NextRequest, NextResponse } from "next/server";
import { getPortalActor } from "@/lib/portal/auth";
import { grantStaffRoleForAdmin } from "@/lib/portal/data/staff";
import { grantStaffRoleSchema, firstIssueMessage } from "@/lib/portal/adminValidation";
import { hasValidOrigin } from "@/lib/portal/request";

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor?.isAdmin) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = grantStaffRoleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });

  const role = await grantStaffRoleForAdmin(actor, parsed.data);
  if (!role) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ role });
}
