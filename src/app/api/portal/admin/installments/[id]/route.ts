import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import {
  markInstallmentPaidForStaff,
  adjustInstallmentForStaff,
  waiveInstallmentForStaff,
} from "@/lib/portal/data/installments";
import {
  markPaidSchema,
  adjustInstallmentSchema,
  waiveInstallmentSchema,
  firstIssueMessage,
} from "@/lib/portal/adminValidation";
import { hasValidOrigin } from "@/lib/portal/request";

const actionSchema = z.object({ action: z.enum(["mark_paid", "adjust", "waive"]) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const actionParsed = actionSchema.safeParse(body);
  if (!actionParsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  if (actionParsed.data.action === "mark_paid") {
    const parsed = markPaidSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    const updated = await markInstallmentPaidForStaff(actor, params.id, { paidOn: new Date(parsed.data.paidOn), note: parsed.data.note });
    if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ installment: updated });
  }

  if (actionParsed.data.action === "adjust") {
    const parsed = adjustInstallmentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    const updated = await adjustInstallmentForStaff(actor, params.id, { dueOn: new Date(parsed.data.dueOn), note: parsed.data.note });
    if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ installment: updated });
  }

  const parsed = waiveInstallmentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  const updated = await waiveInstallmentForStaff(actor, params.id, { note: parsed.data.note });
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ installment: updated });
}
