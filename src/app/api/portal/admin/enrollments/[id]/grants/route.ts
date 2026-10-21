import { NextRequest, NextResponse } from "next/server";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { grantPartnerAccessForStaff } from "@/lib/portal/data/partners";
import { grantPartnerAccessSchema, firstIssueMessage } from "@/lib/portal/adminValidation";
import { hasValidOrigin } from "@/lib/portal/request";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = grantPartnerAccessSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });

  // memberConsentConfirmed is required by the schema (literal true) — the
  // UI must have the admin check "member gave written OK" before this can
  // ever be sent, and that fact is itself logged via grantedVia below.
  const grant = await grantPartnerAccessForStaff(actor, {
    enrollmentId: params.id,
    partnerOrgId: parsed.data.partnerOrgId,
    modules: parsed.data.modules,
    grantedVia: "coach_with_consent",
  });
  if (!grant) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ grant });
}
