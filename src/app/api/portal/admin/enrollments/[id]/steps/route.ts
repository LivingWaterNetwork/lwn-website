import { NextRequest, NextResponse } from "next/server";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { createStepForStaff } from "@/lib/portal/data/steps";
import { createStepSchema, firstIssueMessage } from "@/lib/portal/adminValidation";
import { hasValidOrigin } from "@/lib/portal/request";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = createStepSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });

  const step = await createStepForStaff(actor, params.id, {
    title: parsed.data.title,
    detail: parsed.data.detail,
    phaseKey: parsed.data.phaseKey,
    meetingId: parsed.data.meetingId,
    dueOn: parsed.data.dueOn ? new Date(parsed.data.dueOn) : null,
    tags: parsed.data.tags,
    order: parsed.data.order,
  });
  if (!step) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ step });
}
