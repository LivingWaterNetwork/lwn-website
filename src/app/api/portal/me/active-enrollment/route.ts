import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPortalActor } from "@/lib/portal/auth";
import { setActiveEnrollmentForActor } from "@/lib/portal/data/enrollments";
import { hasValidOrigin } from "@/lib/portal/request";

const schema = z.object({ enrollmentId: z.string().min(1) });

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const actor = await getPortalActor();
  if (!actor) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const ok = await setActiveEnrollmentForActor(actor, parsed.data.enrollmentId);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ success: true });
}
