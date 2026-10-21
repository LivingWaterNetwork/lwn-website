import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { reorderStepsForStaff } from "@/lib/portal/data/steps";
import { hasValidOrigin } from "@/lib/portal/request";

const schema = z.object({ stepIds: z.array(z.string().min(1)).min(1) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const ok = await reorderStepsForStaff(actor, params.id, parsed.data.stepIds);
  if (!ok) return NextResponse.json({ error: "Could not reorder — the step list may be out of date. Refresh and try again." }, { status: 409 });

  return NextResponse.json({ success: true });
}
