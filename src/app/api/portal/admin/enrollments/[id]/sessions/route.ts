import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { createMeetingForStaff } from "@/lib/portal/data/meetings";
import { firstIssueMessage } from "@/lib/portal/adminValidation";
import { hasValidOrigin } from "@/lib/portal/request";

const schema = z.object({
  scheduledAt: z.string().trim().optional(),
  durationMin: z.number().int().positive().optional(),
  format: z.enum(["zoom", "phone", "in_person"]).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });

  const meeting = await createMeetingForStaff(actor, params.id, {
    scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    durationMin: parsed.data.durationMin,
    format: parsed.data.format,
  });
  if (!meeting) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ session: meeting });
}
