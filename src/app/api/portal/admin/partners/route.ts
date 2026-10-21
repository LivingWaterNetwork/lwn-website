import { NextRequest, NextResponse } from "next/server";
import { getPortalActor } from "@/lib/portal/auth";
import { createPartnerOrgForAdmin } from "@/lib/portal/data/partners";
import { createPartnerOrgSchema, firstIssueMessage } from "@/lib/portal/adminValidation";
import { hasValidOrigin } from "@/lib/portal/request";

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor?.isAdmin) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = createPartnerOrgSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });

  const org = await createPartnerOrgForAdmin(actor, parsed.data);
  if (!org) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ org });
}
