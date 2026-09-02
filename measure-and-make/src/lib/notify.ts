import "server-only";

import { CONTACT_EMAIL } from "@/content/site";
import type { ContactSubmission } from "./contact-schema";

/**
 * A second, independent notification path to the same inbox.
 *
 * The Airtable base already carries an automation that emails
 * info@lwnetwork.org on every new Inquiries record, so this is belt-and-braces:
 * it runs only when RESEND_API_KEY and CONTACT_FROM_EMAIL are both set, and a
 * failure here never fails the submission — the record is already saved, and
 * telling the visitor otherwise would be inaccurate.
 */
export async function sendInquiryNotification(
  submission: ContactSubmission,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) return;

  const to = process.env.CONTACT_NOTIFICATION_EMAIL || CONTACT_EMAIL;

  const lines = [
    "A new inquiry was submitted through the Measure & Make website contact form.",
    "",
    `Name: ${submission.name}`,
    `Organization: ${submission.organization}`,
    `Email: ${submission.email}`,
    submission.phone ? `Phone: ${submission.phone}` : null,
    submission.organizationType
      ? `Organization type: ${submission.organizationType}`
      : null,
    submission.interests.length
      ? `Hoping to work on: ${submission.interests.join(", ")}`
      : null,
    "",
    submission.message ? `Message:\n${submission.message}` : "No message given.",
  ].filter((line): line is string => line !== null);

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: submission.email,
      subject: `New Measure & Make inquiry — ${submission.organization}`,
      text: lines.join("\n"),
    }),
    cache: "no-store",
  });
}
