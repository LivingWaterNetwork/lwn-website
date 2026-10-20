import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgreementSession, getClientIp } from "@/lib/agreements/requestHelpers";
import { logAgreementEvent } from "@/lib/agreements/events";
import { signSchema, firstIssueMessage } from "@/lib/agreements/validation";
import { namesMatch } from "@/lib/agreements/names";
import { sendAgreementsNotificationEmail, sendAgreementSignerEmail } from "@/lib/email";
import { generateAndStoreAgreementPdf } from "@/lib/pdf/agreements/generateAgreementPdf";
import { finalizeExecution } from "@/lib/agreements/finalize";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const resolved = await requireAgreementSession(req, params.slug);
  if ("error" in resolved) return resolved.error;
  const { agreement } = resolved;

  if (!["ready", "sent", "viewed", "partially_signed"].includes(agreement.status)) {
    return NextResponse.json({ error: `This agreement cannot be signed in its current state ("${agreement.status}").` }, { status: 409 });
  }

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

  const requiredSections = ((agreement.template.requiredInitials ?? []) as Array<{ section: string }>).map((r) => r.section);
  const initials = (participant.initials as Record<string, boolean>) ?? {};
  const missing = requiredSections.filter((s) => !initials[s]);
  if (missing.length > 0) {
    return NextResponse.json({ error: `Please initial section${missing.length > 1 ? "s" : ""} ${missing.join(", ")} first.` }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = signSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  if (!namesMatch(parsed.data.typedName, participant.name)) {
    return NextResponse.json({ error: `Please type your name exactly as it appears on the agreement: "${participant.name}".` }, { status: 400 });
  }

  const now = new Date();
  await prisma.agreementSigner.update({
    where: { id: participant.id },
    data: {
      status: "signed",
      signedAt: now,
      typedName: parsed.data.typedName,
      signatureImage: parsed.data.signatureImage ?? null,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    },
  });

  await logAgreementEvent(req, agreement.id, "signed", { actorRole: "participant" });

  const refreshed = await prisma.agreement.findUniqueOrThrow({
    where: { id: agreement.id },
    include: { signers: true },
  });
  const allSigned = refreshed.signers.every((s) => s.status === "signed");
  const nextStatus = allSigned ? "executed" : "partially_signed";
  await prisma.agreement.update({ where: { id: agreement.id }, data: { status: nextStatus } });

  // LWN/MMG may have already signed before the participant ever opened the
  // link ("presigned") — in that case her signature is the one that
  // completes execution, so this route (not the countersign route) is the
  // one that needs to generate the executed PDF and send the "fully
  // executed" notifications. Otherwise, this is a normal in-progress
  // signature: generate the participant-signed snapshot and let her know
  // LWN will countersign next.
  if (allSigned) {
    await finalizeExecution(agreement, participant);
  } else {
    try {
      await generateAndStoreAgreementPdf(agreement.id, "participant_signed");
    } catch (err) {
      console.error("[agreements/sign] PDF generation failed:", err);
    }

    if (!agreement.isTest) {
      sendAgreementsNotificationEmail({
        subject: "Agreement signed by participant",
        text: `${participant.name} signed an agreement.\n\nAgreement: ${agreement.slug}\nStatus: ${nextStatus}`,
      }).catch((err) => console.error("[agreements/sign] notify failed:", err));

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lwnetwork.org";
      sendAgreementSignerEmail({
        to: participant.email,
        subject: "Your signed copy — Living Water Network",
        text: `Thank you for signing, ${participant.name}.\n\nYou can view and download your copy any time at:\n${siteUrl}/agreements/${agreement.slug}\n\n(You'll need your access code.)\n\nLWN will countersign shortly, and you'll be able to download the fully executed copy from the same link.`,
      }).catch((err) => console.error("[agreements/sign] signer email failed:", err));
    } else {
      console.log(`[agreements/sign] test record — skipping notification/signer email (no recipient) for ${agreement.slug}`);
    }
  }

  return NextResponse.json({ success: true, status: nextStatus });
}
