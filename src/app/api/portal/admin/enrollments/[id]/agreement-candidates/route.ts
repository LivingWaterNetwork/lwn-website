import { NextRequest, NextResponse } from "next/server";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { searchAgreementsForLinking } from "@/lib/portal/data/agreementLinking";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const email = req.nextUrl.searchParams.get("email") ?? "";
  if (!email.trim()) return NextResponse.json({ candidates: [] });

  const candidates = await searchAgreementsForLinking(actor, params.id, email);
  if (candidates === null) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ candidates });
}
