import { NextRequest, NextResponse } from "next/server";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { revokePartnerGrantForStaff } from "@/lib/portal/data/partners";
import { hasValidOrigin } from "@/lib/portal/request";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const grant = await revokePartnerGrantForStaff(actor, params.id);
  if (!grant) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ grant });
}
