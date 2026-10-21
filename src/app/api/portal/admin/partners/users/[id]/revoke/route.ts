import { NextRequest, NextResponse } from "next/server";
import { getPortalActor } from "@/lib/portal/auth";
import { revokePartnerUserForAdmin } from "@/lib/portal/data/partners";
import { hasValidOrigin } from "@/lib/portal/request";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor?.isAdmin) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const user = await revokePartnerUserForAdmin(actor, params.id);
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ user });
}
