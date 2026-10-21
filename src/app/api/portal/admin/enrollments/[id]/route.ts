import { NextRequest, NextResponse } from "next/server";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { updateEnrollmentForStaff } from "@/lib/portal/data/admin";
import { updateEnrollmentSchema, firstIssueMessage } from "@/lib/portal/adminValidation";
import { hasValidOrigin } from "@/lib/portal/request";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateEnrollmentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });

  const updated = await updateEnrollmentForStaff(actor, params.id, {
    coachPersonId: parsed.data.coachPersonId,
    startDate: parsed.data.startDate !== undefined ? (parsed.data.startDate ? new Date(parsed.data.startDate) : null) : undefined,
    endDate: parsed.data.endDate !== undefined ? (parsed.data.endDate ? new Date(parsed.data.endDate) : null) : undefined,
    currentPhaseKey: parsed.data.currentPhaseKey,
    modules: parsed.data.modules,
    agreementId: parsed.data.agreementId,
    paymentUrl: parsed.data.paymentUrl,
  });

  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ enrollment: updated });
}
