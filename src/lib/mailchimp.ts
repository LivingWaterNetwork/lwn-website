/**
 * Mailchimp integration — adds donors to an audience after a successful donation
 * so automated welcome/thank-you sequences can fire.
 *
 * Setup:
 *  1. Create a free Mailchimp account at mailchimp.com
 *  2. Create an Audience called "LWN Donors"
 *  3. Go to Account → Extras → API keys → Create A Key
 *  4. Note your server prefix from the API key (e.g. "us21" in key ending "...us21")
 *  5. Get your Audience ID: Audience → Settings → Audience name and defaults
 *  6. Build a "Customer journey" automation in Mailchimp:
 *       Trigger: "Joins audience" → send Welcome email → delay 3 days → send Impact update
 *  7. Add the env vars below to .env.local
 */

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY ?? "";
const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER_PREFIX ?? ""; // e.g. "us21"
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID ?? "";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function donationTier(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 5000) return "Champion ($5k+)";
  if (dollars >= 1000) return "Sustainer ($1k+)";
  if (dollars >= 500) return "Partner ($500+)";
  if (dollars >= 100) return "Supporter ($100+)";
  return "Friend";
}

/**
 * Adds a donor to the Mailchimp audience. If they're already subscribed,
 * it updates their tags instead of throwing an error.
 */
export async function addDonorToMailchimp(data: {
  email: string;
  name: string;
  amount: number;   // in cents
  frequency: string;
}) {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER || !MAILCHIMP_AUDIENCE_ID) {
    console.warn("[mailchimp] Keys not set — skipping donor sync");
    return null;
  }

  const [firstName, ...rest] = (data.name || "Friend").split(" ");
  const lastName = rest.join(" ");

  const memberHash = Buffer.from(data.email.toLowerCase())
    .toString("base64")
    // Mailchimp uses MD5 hash of lowercase email — we'll use the PUT endpoint which upserts
    ;

  // Use MD5 hash of email (Mailchimp standard)
  const crypto = await import("crypto");
  const emailHash = crypto.createHash("md5").update(data.email.toLowerCase()).digest("hex");

  const tags = [
    "donor",
    data.frequency === "monthly" ? "recurring-monthly"
      : data.frequency === "yearly" ? "recurring-yearly"
      : "one-time",
    donationTier(data.amount),
  ];

  // PUT (upsert) — adds new subscriber or updates existing
  const res = await fetch(
    `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${emailHash}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: data.email,
        status_if_new: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
          AMOUNT: formatAmount(data.amount),
          FREQ: data.frequency,
        },
        tags,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("[mailchimp] Failed to add donor:", err);
    return null;
  }

  // Mailchimp tags require a separate PATCH call on the member's tags
  await fetch(
    `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${emailHash}/tags`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tags: tags.map((name) => ({ name, status: "active" })),
      }),
    }
  );

  return res.json();
}
