import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueAccessCode } from "@/lib/agreements/service";
import { logAgreementEvent } from "@/lib/agreements/events";

/** Issues a fresh access code, invalidating the old one immediately. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const agreement = await prisma.agreement.findUnique({ where: { id: params.id } });
  if (!agreement) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const code = await issueAccessCode(agreement.id);
  await logAgreementEvent(req, agreement.id, "regenerated_code", { actorRole: "admin" });

  return NextResponse.json({ success: true, code });
}
