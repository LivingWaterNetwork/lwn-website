import { Resend } from "resend";
import { sendGraphMail, graphMailConfigured } from "./graphMail";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
// Temporary: using Resend shared domain until lwnetwork.org MX DNS record is added.
// (Graph mail below is the preferred path — no DNS dependency at all.)
const FROM = process.env.RESEND_FROM_EMAIL ?? "Living Water Network <onboarding@resend.dev>";
const NOTIFY_TO = process.env.NOTIFY_EMAIL ?? "info@lwnetwork.org";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

/**
 * Sends via Microsoft Graph if configured (MS_TENANT_ID / MS_CLIENT_ID /
 * MS_CLIENT_SECRET set + admin consent granted), otherwise falls back to
 * Resend. This means email starts working the moment Graph is configured,
 * with zero changes needed elsewhere in the app.
 */
async function deliver(to: string, subject: string, text: string): Promise<void> {
  // TEMP DIAGNOSTIC — remove after verifying delivery path in production logs.
  console.log("[email] deliver() diagnostic:", {
    graphConfigured: graphMailConfigured(),
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
    notifyTo: NOTIFY_TO,
  });

  if (graphMailConfigured()) {
    try {
      await sendGraphMail({ to, subject, text });
      return;
    } catch (err) {
      console.error("[email] Graph send failed, falling back to Resend:", err);
      // fall through to Resend below
    }
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] No email provider configured — skipping:", subject);
    return;
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, text });
  if (error) {
    console.error("[email] Resend failed to send:", error);
    throw new Error(`Resend error: ${error.message}`);
  }
}

/** Internal notification email (e.g. new application, contact form) */
export async function sendNotificationEmail({
  subject,
  text,
}: {
  subject: string;
  text: string;
}) {
  await deliver(NOTIFY_TO, subject, text);
}

/** Donor-facing receipt email */
export async function sendDonationReceipt({
  to,
  name,
  amount,
  frequency,
  donationId,
}: {
  to: string;
  name: string;
  amount: number;
  frequency: string;
  donationId: string;
}) {
  const freqLabel =
    frequency === "monthly"
      ? "monthly recurring"
      : frequency === "yearly"
      ? "annual recurring"
      : "one-time";

  const text = `
Dear ${name},

Thank you for your generous ${freqLabel} gift of ${formatAmount(amount)} to Living Water Network!

Your generosity helps us equip Kingdom leaders to disrupt darkness and disciple nations. We are deeply grateful for your partnership in this mission.

Living Water Network Inc. is a 501(c)(3) nonprofit organization. Your donation is tax-deductible to the extent allowed by law. Please keep this email as your receipt.

Donation ID: ${donationId}
Amount: ${formatAmount(amount)}
Type: ${freqLabel.charAt(0).toUpperCase() + freqLabel.slice(1)}

With gratitude,
Living Water Network
info@lwnetwork.org
  `.trim();

  await deliver(to, `Thank you for your ${freqLabel} gift — Living Water Network`, text);
}
