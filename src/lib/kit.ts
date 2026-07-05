/**
 * Kit (formerly ConvertKit) integration
 * Adds donors to your Kit audience with tags after each successful donation,
 * so automated welcome/thank-you sequences fire automatically.
 *
 * Setup (2 minutes):
 *  1. Go to kit.com → create a free account (no address required)
 *  2. Settings → Developer → API Keys → copy your API Key (v3)
 *  3. Add KIT_API_KEY to .env.local
 *  4. Build your automation: Automations → New automation
 *       Trigger: "Tag is added" → select "donor"
 *       Step 1: Send email — Welcome / Thank You (immediate)
 *       Step 2: Wait 3 days
 *       Step 3: Send email — Impact update
 *
 * No form ID needed — donors are subscribed directly and tagged.
 */

const KIT_API_KEY = process.env.KIT_API_KEY ?? "";

const KIT_API_BASE = "https://api.convertkit.com/v3";

function donationTier(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 5000) return "Champion";
  if (dollars >= 1000) return "Sustainer";
  if (dollars >= 500) return "Partner";
  if (dollars >= 100) return "Supporter";
  return "Friend";
}

async function ensureTag(tagName: string): Promise<number | null> {
  // Create tag (Kit returns existing tag if name already exists)
  const res = await fetch(`${KIT_API_BASE}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_secret: KIT_API_KEY, tag: { name: tagName } }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.id ?? null;
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_secret: KIT_API_KEY,
      email: data.email,
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
    console.error("[kit] Failed to upsert subscriber:", err);
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
      await fetch(`${KIT_API_BASE}/subscribers/${subscriberId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_secret: KIT_API_KEY, tag: { id: tagId } }),
      });
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
    console.warn("[kit] KIT_API_KEY not set — skipping newsletter sync");
    return null;
  }

  const subRes = await fetch(`${KIT_API_BASE}/subscribers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_secret: KIT_API_KEY,
      email,
      first_name: firstName || undefined,
    }),
  });

  if (!subRes.ok) {
    const err = await subRes.text();
    console.error("[kit] Failed to upsert newsletter subscriber:", err);
    throw new Error("Failed to subscribe");
  }

  const subData = await subRes.json();
  const subscriberId: number = subData.subscriber?.id;
  if (subscriberId) {
    const tagId = await ensureTag("newsletter");
    if (tagId) {
      await fetch(`${KIT_API_BASE}/subscribers/${subscriberId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_secret: KIT_API_KEY, tag: { id: tagId } }),
      });
    }
  }

  return subData;
}
