/**
 * Sends mail via Microsoft Graph using an Entra ID app registration
 * ("LWN Website Mailer") with the Mail.Send application permission.
 *
 * This exists as a DNS-free alternative to Resend: Resend requires an MX
 * record on send.lwnetwork.org, which Wix won't let us add. Graph sends
 * through the existing Microsoft 365 mailbox (info@lwnetwork.org) instead —
 * no DNS changes required.
 *
 * Requires MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_SEND_AS_EMAIL in
 * .env.local / Vercel env vars, and admin consent granted for Mail.Send in
 * Entra ID (Enterprise applications → LWN Website Mailer → Permissions).
 */

const TENANT_ID = process.env.MS_TENANT_ID ?? "";
const CLIENT_ID = process.env.MS_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.MS_CLIENT_SECRET ?? "";
const SEND_AS = process.env.MS_SEND_AS_EMAIL ?? "info@lwnetwork.org";

export function graphMailConfigured(): boolean {
  return Boolean(TENANT_ID && CLIENT_ID && CLIENT_SECRET);
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getGraphToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const res = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[graphMail] Failed to get token: ${err}`);
  }

  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

export type GraphAttachment = {
  filename: string;
  contentBytes: string; // base64
  contentType: string;
};

export async function sendGraphMail({
  to,
  subject,
  text,
  from,
  attachments,
}: {
  to: string;
  subject: string;
  text: string;
  /**
   * Optional sender mailbox override. The "LWN Website Mailer" Entra ID app
   * has the Mail.Send APPLICATION permission, which grants it the ability to
   * send as ANY mailbox in the tenant (not just SEND_AS) — this just changes
   * which mailbox the API call targets. Used e.g. to send donation
   * thank-you letters from ofandino@lwnetwork.org instead of info@.
   */
  from?: string;
  /** Optional file attachments (e.g. a PDF thank-you letter). */
  attachments?: GraphAttachment[];
}): Promise<void> {
  const token = await getGraphToken();
  const mailbox = from ?? SEND_AS;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: "Text", content: text },
          toRecipients: [{ emailAddress: { address: to } }],
          ...(attachments && attachments.length > 0
            ? {
                attachments: attachments.map((a) => ({
                  "@odata.type": "#microsoft.graph.fileAttachment",
                  name: a.filename,
                  contentType: a.contentType,
                  contentBytes: a.contentBytes,
                })),
              }
            : {}),
        },
        saveToSentItems: true,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[graphMail] sendMail failed: ${err}`);
  }
}
