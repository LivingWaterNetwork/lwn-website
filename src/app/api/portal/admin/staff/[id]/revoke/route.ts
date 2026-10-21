import { NextRequest, NextResponse } from "next/server";
import { getPortalActor } from "@/lib/portal/auth";
import { revokeStaffRoleForAdmin } from "@/lib/portal/data/staff";
import { hasValidOrigin } from "@/lib/portal/request";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor?.isAdmin) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const role = await revokeStaffRoleForAdmin(actor, params.id);
  if (!role) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ role });
}
