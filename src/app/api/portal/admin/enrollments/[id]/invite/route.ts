import { NextRequest, NextResponse } from "next/server";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { inviteMemberForStaff } from "@/lib/portal/data/admin";
import { hasValidOrigin } from "@/lib/portal/request";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const result = await inviteMemberForStaff(actor, params.id);
  if (!result.sent) return NextResponse.json({ error: result.reason }, { status: 400 });
  return NextResponse.json({ success: true });
}
