import { generateAndStoreAgreementPdf } from "@/lib/pdf/agreements/generateAgreementPdf";
import { sendAgreementsNotificationEmail, sendAgreementSignerEmail } from "@/lib/email";

/**
 * Runs once, whichever action happens to be the one that completes every
 * required signature — LWN/MMG can sign before the participant (so the
 * agreement is "presigned" and only the participant's signature remains) or
 * after, in the original order. Either the sign route or the countersign
 * route may be the one that pushes the agreement to "executed", so both call
 * this instead of duplicating the PDF/notification logic.
 */
export async function finalizeExecution(
  agreement: { id: string; slug: string; isTest: boolean },
  participant: { name: string; email: string } | undefined
): Promise<void> {
  try {
    await generateAndStoreAgreementPdf(agreement.id, "executed");
  } catch (err) {
    console.error("[agreements/finalize] executed PDF generation failed:", err);
  }

  if (!agreement.isTest && participant) {
    sendAgreementsNotificationEmail({
      subject: "Agreement fully executed",
      text: `Agreement ${agreement.slug} is now fully executed.`,
    }).catch((err) => console.error("[agreements/finalize] notify failed:", err));

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lwnetwork.org";
    sendAgreementSignerEmail({
      to: participant.email,
      subject: "Your agreement is fully executed — Living Water Network",
      text: `Great news, ${participant.name} — your agreement with Living Water Network is now fully executed.\n\nYou can download the final copy any time at:\n${siteUrl}/agreements/${agreement.slug}\n\n(You'll need your access code.)`,
    }).catch((err) => console.error("[agreements/finalize] signer email failed:", err));
  } else {
    console.log(`[agreements/finalize] test record — skipping notification/signer email (no recipient) for ${agreement.slug}`);
  }
}
