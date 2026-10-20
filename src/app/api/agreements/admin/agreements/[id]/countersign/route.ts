import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAgreementEvent } from "@/lib/agreements/events";
import { adminCountersignSchema, firstIssueMessage } from "@/lib/agreements/validation";
import { getClientIp } from "@/lib/agreements/requestHelpers";
import { CONSENT_VERSION } from "@/lib/agreements/consent";
import { finalizeExecution } from "@/lib/agreements/finalize";

/**
 * LWN's countersignature — the organization-role signer, using the same
 * consent + typed/drawn signature flow as the participant. This can happen
 * before or after the participant signs: LWN (and MMG, via partner-accept)
 * can "presign" their side so the participant's signature is the only one
 * left and the agreement executes the moment she signs, or LWN can
 * countersign last, in the original order. Either way, `finalizeExecution`
 * is only ever run once — by whichever route happens to complete the set.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const agreement = await prisma.agreement.findUnique({
    where: { id: params.id },
    include: { signers: true },
  });
  if (!agreement) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const organization = agreement.signers.find((s) => s.role === "organization");
  if (!organization) {
    return NextResponse.json({ error: "This template has no organization signer." }, { status: 400 });
  }
  if (organization.status === "signed") {
    return NextResponse.json({ error: "Already countersigned." }, { status: 409 });
  }

  const participant = agreement.signers.find((s) => s.role === "participant");

  const body = await req.json().catch(() => null);
  const parsed = adminCountersignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  await prisma.agreementSigner.update({
    where: { id: organization.id },
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

  await logAgreementEvent(req, agreement.id, "countersigned", { actorRole: "admin" });

  const refreshed = await prisma.agreement.findUniqueOrThrow({ where: { id: agreement.id }, include: { signers: true } });
  const allSigned = refreshed.signers.every((s) => s.status === "signed");

  if (allSigned) {
    await prisma.agreement.update({ where: { id: agreement.id }, data: { status: "executed" } });
    await finalizeExecution(agreement, participant ? { name: participant.name, email: participant.email } : undefined);
  }

  return NextResponse.json({ success: true, status: allSigned ? "executed" : agreement.status });
}
