import { NextRequest, NextResponse } from "next/server";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { updateMeetingForStaff } from "@/lib/portal/data/meetings";
import { updateSessionSchema, firstIssueMessage } from "@/lib/portal/adminValidation";
import { hasValidOrigin } from "@/lib/portal/request";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateSessionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });

  const updated = await updateMeetingForStaff(actor, params.id, {
    scheduledAt: parsed.data.scheduledAt !== undefined ? (parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null) : undefined,
    durationMin: parsed.data.durationMin,
    format: parsed.data.format,
    status: parsed.data.status,
    countsTowardTotal: parsed.data.countsTowardTotal,
    sharedRecap: parsed.data.sharedRecap,
  });
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ session: updated });
}
