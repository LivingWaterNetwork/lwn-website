import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAgreementEvent } from "@/lib/agreements/events";
import { adminVoidSchema, firstIssueMessage } from "@/lib/agreements/validation";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const agreement = await prisma.agreement.findUnique({ where: { id: params.id } });
  if (!agreement) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (agreement.status === "voided") {
    return NextResponse.json({ error: "Already voided." }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = adminVoidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  await prisma.agreement.update({
    where: { id: agreement.id },
    data: { status: "voided", voidedReason: parsed.data.reason, voidedAt: new Date() },
  });
  await logAgreementEvent(req, agreement.id, "voided", { actorRole: "admin", detail: parsed.data.reason });

  return NextResponse.json({ success: true });
}
