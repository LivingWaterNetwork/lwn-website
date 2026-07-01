import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const FROM = "Living Water Network <info@lwnetwork.org>";
const NOTIFY_TO = process.env.NOTIFY_EMAIL ?? "info@lwnetwork.org";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

/** Internal notification email (e.g. new application, contact form) */
export async function sendNotificationEmail({
  subject,
  text,
}: {
  subject: string;
  text: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping notification email");
    return;
  }
    const { error } = await resend.emails.send({ from: FROM, to: NOTIFY_TO, subject, text });
    if (error) {
          console.error("[email] Resend failed to send notification email:", error);
          throw new Error(`Resend error: ${error.message}`);
    }
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
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping receipt email");
    return;
  }

  const freqLabel =
    frequency === "monthly"
      ? "monthly recurring"
      : frequency === "yearly"
      ? "annual recurring"
      : "one-time";

  const { error: sendError } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Thank you for your ${freqLabel} gift — Living Water Network`,
    text: `
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
    `.trim(),
  });
  if (sendError) {
        console.error("[email] Resend failed to send donation receipt:", sendError);
        throw new Error(`Resend error: ${sendError.message}`);
  }
}
