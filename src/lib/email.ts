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
async function deliver(to: string, subject: string, text: string, html?: string): Promise<void> {
  if (graphMailConfigured()) {
    try {
      await sendGraphMail({ to, subject, text, html });
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

  const { error } = await resend.emails.send({ from: FROM, to, subject, text, ...(html ? { html } : {}) });
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

const SITE_URL = "https://www.lwnetwork.org";
const NAVY = "#0A2A47";
const COPPER = "#C05A12";
const SPRING = "#7CCBE6";
const MIST = "#EAF1F6";
const SLATE = "#445563";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function donationReceiptHtml({
  name,
  amount,
  freqLabel,
  donationId,
  date,
}: {
  name: string;
  amount: number;
  freqLabel: string;
  donationId: string;
  date: Date;
}): string {
  const donorName = escapeHtml(name?.trim() || "Friend");
  const typeLabel = freqLabel.charAt(0).toUpperCase() + freqLabel.slice(1);

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Thank you — Living Water Network</title>
  </head>
  <body style="margin:0; padding:0; background-color:${MIST}; font-family:Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${MIST}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:8px; overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="background-color:${NAVY}; padding:28px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="middle">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td valign="middle" style="background-color:#ffffff; border-radius:6px; padding:6px; line-height:0;">
                            <img src="${SITE_URL}/images/logo-mark.png" width="32" height="32" alt="Living Water Network" style="display:block; width:32px; height:32px;" />
                          </td>
                          <td valign="middle" style="padding-left:12px;">
                            <div style="color:#ffffff; font-size:17px; font-weight:bold; font-family:Georgia, 'Times New Roman', serif;">Living Water Network</div>
                            <div style="color:${SPRING}; font-size:11px; font-family:Arial, Helvetica, sans-serif; margin-top:2px;">Rooted in truth. Sent to lead.</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Copper rule -->
            <tr><td style="background-color:${COPPER}; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>

            <!-- Body -->
            <tr>
              <td style="padding:36px 40px 8px 40px; font-family:Arial, Helvetica, sans-serif;">
                <div style="color:${SLATE}; font-size:13px; margin-bottom:20px;">${formatDate(date)}</div>
                <div style="color:${NAVY}; font-size:16px; font-weight:bold; margin-bottom:16px; font-family:Georgia, 'Times New Roman', serif;">Dear ${donorName},</div>
                <p style="color:#333333; font-size:14px; line-height:1.65; margin:0 0 14px 0;">
                  Thank you for your generous ${freqLabel} gift of <strong style="color:${NAVY};">${formatAmount(amount)}</strong> to Living Water Network!
                </p>
                <p style="color:#333333; font-size:14px; line-height:1.65; margin:0 0 4px 0;">
                  Your generosity helps us equip Kingdom leaders to disrupt darkness and disciple nations. We are deeply grateful for your partnership in this mission.
                </p>
              </td>
            </tr>

            <!-- Gift details box -->
            <tr>
              <td style="padding:8px 40px 0 40px; font-family:Arial, Helvetica, sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${MIST}; border-radius:6px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <div style="color:${COPPER}; font-size:11px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; margin-bottom:10px;">Your Gift</div>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:${SLATE}; font-size:13px; padding:3px 0;">Amount</td>
                          <td align="right" style="color:${NAVY}; font-size:13px; font-weight:bold; padding:3px 0;">${formatAmount(amount)}</td>
                        </tr>
                        <tr>
                          <td style="color:${SLATE}; font-size:13px; padding:3px 0;">Type</td>
                          <td align="right" style="color:${NAVY}; font-size:13px; font-weight:bold; padding:3px 0;">${typeLabel}</td>
                        </tr>
                        <tr>
                          <td style="color:${SLATE}; font-size:13px; padding:3px 0;">Donation ID</td>
                          <td align="right" style="color:${NAVY}; font-size:13px; font-weight:bold; padding:3px 0;">${escapeHtml(donationId)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- IRS language -->
            <tr>
              <td style="padding:22px 40px 0 40px; font-family:Arial, Helvetica, sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-left:3px solid ${COPPER}; padding:2px 0 2px 14px;">
                      <p style="color:${SLATE}; font-size:11.5px; line-height:1.6; margin:0;">
                        Living Water Network Inc. is a tax-exempt organization under Section 501(c)(3) of the Internal Revenue Code (EIN 93-1859873). No goods or services were provided in exchange for this contribution. Please keep this email as your official record of this gift for tax purposes.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Signature -->
            <tr>
              <td style="padding:26px 40px 36px 40px; font-family:Arial, Helvetica, sans-serif;">
                <div style="color:#333333; font-size:14px; margin-bottom:16px;">With gratitude,</div>
                <div style="color:${NAVY}; font-size:15px; font-weight:bold; font-family:Georgia, 'Times New Roman', serif;">Living Water Network</div>
                <div style="color:${SLATE}; font-size:12px; margin-top:2px;">info@lwnetwork.org</div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid ${MIST}; padding:16px 40px; font-family:Arial, Helvetica, sans-serif;">
                <p style="color:#8A97A3; font-size:10.5px; line-height:1.5; text-align:center; margin:0;">
                  Living Water Network Inc. &middot; A Georgia 501(c)(3) nonprofit organization &middot; EIN 93-1859873<br />
                  Your donation is tax-deductible to the extent allowed by law. Please retain this email for your tax records.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
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

  const html = donationReceiptHtml({ name, amount, freqLabel, donationId, date: new Date() });

  await deliver(to, `Thank you for your ${freqLabel} gift — Living Water Network`, text, html);
}
