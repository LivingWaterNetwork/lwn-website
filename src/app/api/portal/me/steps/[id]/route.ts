import { NextRequest, NextResponse } from "next/server";
import { getPortalActor } from "@/lib/portal/auth";
import { setStepStatusForMember } from "@/lib/portal/data/steps";
import { memberStepUpdateSchema, firstIssueMessage } from "@/lib/portal/validation";
import { hasValidOrigin } from "@/lib/portal/request";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const actor = await getPortalActor();
  if (!actor) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = memberStepUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  let updated;
  try {
    updated = await setStepStatusForMember(actor, params.id, parsed.data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid request." }, { status: 400 });
  }

  // Scoped-but-missing and genuinely-missing look identical to the caller —
  // both a flat 404, so an id can never be distinguished from "not yours".
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ step: updated });
}
