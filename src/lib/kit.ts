/**
 * Kit (formerly ConvertKit) integration
 * Adds donors to your Kit audience with tags after each successful donation,
 * so automated welcome/thank-you sequences fire automatically.
 *
 * Uses Kit's API v4 (api.kit.com/v4), authenticated via the `X-Kit-Api-Key`
 * header. Kit deprecated the old v3 API (api.convertkit.com/v3 with
 * `api_secret` in the JSON body) — v4 requires a V4 API key, a different
 * base URL, the header auth shown below, and `email_address` (not `email`)
 * in the subscriber payload.
 *
 * Setup (2 minutes):
 *  1. Go to kit.com → create a free account (no address required)
 *  2. Account Settings → Developer → API Keys → create a V4 API Key
 *  3. Add KIT_API_KEY to .env.local (and to Vercel's production env vars)
 *  4. Build your automation: Automations → New automation
 *       Trigger: "Tag is added" → select "donor"
 *       Step 1: Send email — Welcome / Thank You (immediate)
 *       Step 2: Wait 3 days
 *       Step 3: Send email — Impact update
 *
 * No form ID needed — donors are subscribed directly and tagged.
 */

const KIT_API_KEY = process.env.KIT_API_KEY ?? "";

const KIT_API_BASE = "https://api.kit.com/v4";

function kitHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": KIT_API_KEY,
  };
}

function donationTier(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 5000) return "Champion";
  if (dollars >= 1000) return "Sustainer";
  if (dollars >= 500) return "Partner";
  if (dollars >= 100) return "Supporter";
  return "Friend";
}

async function ensureTag(tagName: string): Promise<number | null> {
  // Create tag (Kit returns the existing tag if the name already exists)
  const res = await fetch(`${KIT_API_BASE}/tags`, {
    method: "POST",
    headers: kitHeaders(),
    body: JSON.stringify({ name: tagName }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`[kit] Failed to create/find tag "${tagName}" (${res.status}):`, err);
    return null;
  }
  const data = await res.json();
  return data.tag?.id ?? null;
}

/**
 * Subscribes a donor to Kit and applies relevant tags.
 * Kit upserts automatically — existing subscribers are updated, not duplicated.
 * Automations can be triggered on the "donor" tag.
 */
export async function addDonorToKit(data: {
  email: string;
  name: string;
  amount: number; // in cents
  frequency: string;
}) {
  if (!KIT_API_KEY) {
    console.warn("[kit] KIT_API_KEY not set — skipping donor sync");
    return null;
  }

  const [firstName, ...rest] = (data.name || "Friend").split(" ");
  const lastName = rest.join(" ");
  const tier = donationTier(data.amount);
  const freqLabel =
    data.frequency === "monthly" ? "recurring-monthly"
    : data.frequency === "yearly" ? "recurring-yearly"
    : "one-time";

  // Upsert subscriber
  const subRes = await fetch(`${KIT_API_BASE}/subscribers`, {
    method: "POST",
    headers: kitHeaders(),
    body: JSON.stringify({
      email_address: data.email,
      first_name: firstName,
      fields: {
        last_name: lastName,
        donation_tier: tier,
        donation_frequency: freqLabel,
      },
    }),
  });

  if (!subRes.ok) {
    const err = await subRes.text();
    console.error(`[kit] Failed to upsert subscriber (${subRes.status}):`, err);
    return null;
  }

  const subData = await subRes.json();
  const subscriberId: number = subData.subscriber?.id;
  if (!subscriberId) return subData;

  // Apply tags (donor, frequency, tier)
  const tagNames = ["donor", freqLabel, tier];
  await Promise.allSettled(
    tagNames.map(async (tagName) => {
      const tagId = await ensureTag(tagName);
      if (!tagId) return;
      const tagRes = await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribers/${subscriberId}`, {
        method: "POST",
        headers: kitHeaders(),
        body: JSON.stringify({}),
      });
      if (!tagRes.ok) {
        const err = await tagRes.text();
        console.error(`[kit] Failed to apply tag "${tagName}" (${tagRes.status}):`, err);
      }
    })
  );

  return subData;
}

/**
 * Subscribes someone to the general LWN newsletter (not a donor).
 * Tags them "newsletter" so they can be targeted separately from donor flows.
 */
export async function subscribeToNewsletter(email: string, firstName?: string) {
  if (!KIT_API_KEY) {
    console.error("[kit] KIT_API_KEY not set — cannot subscribe newsletter signup");
    throw new Error("Newsletter signup is not configured (missing KIT_API_KEY)");
  }

  const subRes = await fetch(`${KIT_API_BASE}/subscribers`, {
    method: "POST",
    headers: kitHeaders(),
    body: JSON.stringify({
      email_address: email,
      first_name: firstName || undefined,
    }),
  });

  if (!subRes.ok) {
    let err: string;
    try {
      err = await subRes.text();
    } catch {
      err = "<no response body>";
    }
    console.error(
      `[kit] Failed to upsert newsletter subscriber. Status: ${subRes.status} ${subRes.statusText}. Body:`,
      err
    );
    throw new Error(`Failed to subscribe (Kit responded ${subRes.status}): ${err}`);
  }

  const subData = await subRes.json();
  const subscriberId: number = subData.subscriber?.id;
  if (subscriberId) {
    const tagId = await ensureTag("newsletter");
    if (tagId) {
      const tagRes = await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribers/${subscriberId}`, {
        method: "POST",
        headers: kitHeaders(),
        body: JSON.stringify({}),
      });
      if (!tagRes.ok) {
        const err = await tagRes.text();
        console.error(`[kit] Failed to apply "newsletter" tag (${tagRes.status}):`, err);
      }
    }
  }

  return subData;
}
