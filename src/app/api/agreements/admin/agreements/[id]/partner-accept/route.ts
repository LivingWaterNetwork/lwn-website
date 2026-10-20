import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAgreementEvent } from "@/lib/agreements/events";
import { adminPartnerAcceptSchema, firstIssueMessage } from "@/lib/agreements/validation";
import { getClientIp } from "@/lib/agreements/requestHelpers";
import { CONSENT_VERSION } from "@/lib/agreements/consent";

/** Records MMG's (or whichever role is marked requiredBeforeSend) partner acceptance — required before the participant can be sent the link. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const agreement = await prisma.agreement.findUnique({
    where: { id: params.id },
    include: { signers: true, template: true },
  });
  if (!agreement) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (!["ready", "sent", "viewed", "partially_signed"].includes(agreement.status)) {
    return NextResponse.json({ error: `Agreement must be "ready" first (currently "${agreement.status}").` }, { status: 409 });
  }

  const partner = agreement.signers.find((s) => s.role === "partner");
  if (!partner) {
    return NextResponse.json({ error: "This template has no partner signer." }, { status: 400 });
  }
  if (partner.status === "signed") {
    return NextResponse.json({ error: "Partner acceptance already recorded." }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = adminPartnerAcceptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  await prisma.agreementSigner.update({
    where: { id: partner.id },
    data: {
      status: "signed",
      signedAt: new Date(),
      typedName: parsed.data.typedName,
      signatureImage: parsed.data.signatureImage ?? null,
      consentVersion: CONSENT_VERSION,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    },
  });

  await logAgreementEvent(req, agreement.id, "partner_accepted", { actorRole: "admin" });

  return NextResponse.json({ success: true });
}
