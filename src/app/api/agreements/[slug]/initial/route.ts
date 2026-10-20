import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgreementSession } from "@/lib/agreements/requestHelpers";
import { logAgreementEvent } from "@/lib/agreements/events";
import { initialSchema, firstIssueMessage } from "@/lib/agreements/validation";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const resolved = await requireAgreementSession(req, params.slug);
  if ("error" in resolved) return resolved.error;
  const { agreement } = resolved;

  const participant = agreement.signers.find((s) => s.role === "participant");
  if (!participant) {
    return NextResponse.json({ error: "Agreement is misconfigured." }, { status: 500 });
  }
  if (participant.status === "signed") {
    return NextResponse.json({ error: "This agreement has already been signed." }, { status: 409 });
  }
  if (!participant.consentVersion) {
    return NextResponse.json({ error: "Please consent to electronic signatures first." }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = initialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  const requiredSections = ((agreement.template.requiredInitials ?? []) as Array<{ section: string }>).map(
    (r) => r.section
  );
  if (!requiredSections.includes(parsed.data.section)) {
    return NextResponse.json({ error: "Unknown section." }, { status: 400 });
  }

  const initials = { ...((participant.initials as Record<string, boolean>) ?? {}) };
  if (parsed.data.initialed) {
    initials[parsed.data.section] = true;
  } else {
    delete initials[parsed.data.section];
  }

  await prisma.agreementSigner.update({ where: { id: participant.id }, data: { initials } });
  await logAgreementEvent(req, agreement.id, "initialed", { actorRole: "participant", detail: parsed.data.section });

  return NextResponse.json({ success: true, initials });
}
