import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgreementSession } from "@/lib/agreements/requestHelpers";
import { logAgreementEvent } from "@/lib/agreements/events";
import { CONSENT_VERSION } from "@/lib/agreements/consent";

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

  // The server stamps the current disclosure version — the client never
  // gets to choose which version it "consented" to.
  await prisma.agreementSigner.update({
    where: { id: participant.id },
    data: { consentVersion: CONSENT_VERSION },
  });

  await logAgreementEvent(req, agreement.id, "consented", { actorRole: "participant", detail: CONSENT_VERSION });

  return NextResponse.json({ success: true, consentVersion: CONSENT_VERSION });
}
