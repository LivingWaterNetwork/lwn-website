import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgreementSession } from "@/lib/agreements/requestHelpers";
import { fillSystemTokens, markdownToSafeHtml, formatPaymentDueLabel } from "@/lib/agreements/render";
import { CONSENT_VERSION, CONSENT_DISCLOSURE_PARAGRAPHS } from "@/lib/agreements/consent";
import { computeEffectiveDate } from "@/lib/agreements/effectiveDate";

/**
 * The single source of truth the signer UI loads from on every page load —
 * all step/progress state is derived from this response, never from
 * client-side memory, so reloading mid-flow always resumes correctly.
 */
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const resolved = await requireAgreementSession(req, params.slug);
  if ("error" in resolved) return resolved.error;
  const { agreement } = resolved;

  const participant = agreement.signers.find((s) => s.role === "participant");
  if (!participant) {
    return NextResponse.json({ error: "Agreement is misconfigured (no participant signer)." }, { status: 500 });
  }

  const effectiveDate = computeEffectiveDate(agreement.signers);

  const html = agreement.renderedBody
    ? markdownToSafeHtml(
        fillSystemTokens(agreement.renderedBody, {
          effectiveDate,
          signers: agreement.signers.map((s) => ({
            role: s.role,
            name: s.name,
            title: s.title,
            status: s.status,
            signedAt: s.signedAt,
            typedName: s.typedName,
          })),
        })
      )
    : null;

  const requiredInitials = (agreement.template.requiredInitials ?? []) as Array<{ section: string; label: string }>;

  const identityConfirmed = Boolean(
    await prisma.agreementEvent.findFirst({
      where: { agreementId: agreement.id, type: "identity_confirmed" },
      select: { id: true },
    })
  );

  // Derived from the agreement's own `installments` variable, not hardcoded —
  // a future agreement with different amounts/dates needs no code change.
  const installments = (agreement.variables as { installments?: Array<{ amount: number; due: string }> } | null)
    ?.installments;
  const firstPaymentLabel = installments?.[0] ? formatPaymentDueLabel(installments[0]) : null;

  return NextResponse.json({
    agreement: {
      status: agreement.status,
      expiresAt: agreement.expiresAt,
      // Only surfaced once the participant herself has signed — it's the
      // "make your first payment" step on the confirmation screen, not
      // something to show before she's agreed to anything.
      paymentUrl: participant.status === "signed" ? agreement.paymentUrl : null,
      firstPaymentLabel: participant.status === "signed" ? firstPaymentLabel : null,
    },
    template: { title: agreement.template.title },
    participant: {
      name: participant.name,
      email: participant.email,
      status: participant.status,
      identityConfirmed,
      consentVersion: participant.consentVersion,
      initials: participant.initials ?? {},
      typedName: participant.typedName,
    },
    signers: agreement.signers.map((s) => ({
      role: s.role,
      name: s.name,
      title: s.title,
      status: s.status,
      signedAt: s.signedAt,
    })),
    requiredInitials,
    consent: { currentVersion: CONSENT_VERSION, paragraphs: CONSENT_DISCLOSURE_PARAGRAPHS },
    html,
  });
}
