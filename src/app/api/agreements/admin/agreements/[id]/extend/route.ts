import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAgreementEvent } from "@/lib/agreements/events";
import { adminExtendSchema, firstIssueMessage } from "@/lib/agreements/validation";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const agreement = await prisma.agreement.findUnique({ where: { id: params.id } });
  if (!agreement) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = adminExtendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  const expiresAt = new Date(parsed.data.expiresAt);
  await prisma.agreement.update({ where: { id: agreement.id }, data: { expiresAt } });
  await logAgreementEvent(req, agreement.id, "extended", { actorRole: "admin", detail: expiresAt.toISOString() });

  return NextResponse.json({ success: true, expiresAt });
}
