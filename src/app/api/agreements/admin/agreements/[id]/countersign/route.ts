import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAgreementEvent } from "@/lib/agreements/events";
import { adminCountersignSchema, firstIssueMessage } from "@/lib/agreements/validation";
import { getClientIp } from "@/lib/agreements/requestHelpers";
import { CONSENT_VERSION } from "@/lib/agreements/consent";
import { sendAgreementsNotificationEmail, sendAgreementSignerEmail } from "@/lib/email";
import { generateAndStoreAgreementPdf } from "@/lib/pdf/agreements/generateAgreementPdf";

/** LWN's countersignature — the organization-role signer, using the same consent + typed/drawn signature flow as the participant. */
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
  if (participant && participant.status !== "signed") {
    return NextResponse.json({ error: "Participant hasn't signed yet." }, { status: 409 });
  }

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
    try {
      await generateAndStoreAgreementPdf(agreement.id, "executed");
    } catch (err) {
      console.error("[agreements/countersign] PDF generation failed:", err);
    }

    if (!agreement.isTest && participant) {
      sendAgreementsNotificationEmail({
        subject: "Agreement fully executed",
        text: `Agreement ${agreement.slug} is now fully executed.`,
      }).catch((err) => console.error("[agreements/countersign] notify failed:", err));

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lwnetwork.org";
      sendAgreementSignerEmail({
        to: participant.email,
        subject: "Your agreement is fully executed — Living Water Network",
        text: `Great news, ${participant.name} — your agreement with Living Water Network is now fully executed.\n\nYou can download the final copy any time at:\n${siteUrl}/agreements/${agreement.slug}\n\n(You'll need your access code.)`,
      }).catch((err) => console.error("[agreements/countersign] signer email failed:", err));
    }
  }

  return NextResponse.json({ success: true, status: allSigned ? "executed" : agreement.status });
}
