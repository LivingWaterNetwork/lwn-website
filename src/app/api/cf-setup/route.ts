/**
 * GET /api/cf-setup
 * Temporary endpoint: sets up Cloudflare DNS for Resend verification.
 * - Finds lwnetwork.org zone ID + assigned nameservers
 * - Adds send.lwnetwork.org MX record if missing
 * DELETE THIS FILE once DNS migration is complete.
 */
import { NextResponse } from "next/server";

const CF_TOKEN = process.env.CF_API_TOKEN ?? "";
const CF = "https://api.cloudflare.com/client/v4";

async function cf(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${CF}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${CF_TOKEN}`,
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
  return res.json();
}

export async function GET() {
  if (!CF_TOKEN) return NextResponse.json({ error: "CF_API_TOKEN not set" }, { status: 500 });

  const results: Record<string, unknown> = {};

  // 1. Find zone
  const zones = await cf("/zones?name=lwnetwork.org");
  const zone = zones.result?.[0];
  if (!zone) return NextResponse.json({ error: "lwnetwork.org zone not found in Cloudflare", zones }, { status: 404 });

  results.zone = { id: zone.id, name: zone.name, status: zone.status };
  results.nameservers = zone.name_servers;

  // 2. Check existing MX records for send.lwnetwork.org
  const existing = await cf(`/zones/${zone.id}/dns_records?type=MX&name=send.lwnetwork.org`);
  results.existingMX = existing.result;

  // 3. Add MX record if missing
  const hasMX = existing.result?.some(
    (r: { content: string }) => r.content === "feedback-smtp.us-east-1.amazonses.com"
  );

  if (hasMX) {
    results.mxRecord = "Already exists — send.lwnetwork.org MX to feedback-smtp.us-east-1.amazonses.com";
  } else {
    const add = await cf(`/zones/${zone.id}/dns_records`, {
      method: "POST",
      body: JSON.stringify({
        type: "MX",
        name: "send",
        content: "feedback-smtp.us-east-1.amazonses.com",
        priority: 10,
        ttl: 1,
      }),
    });
    results.mxRecord = add.success
      ? "Added: send.lwnetwork.org MX to feedback-smtp.us-east-1.amazonses.com priority 10"
      : { error: "Failed to add MX record", detail: add };
  }

  // 4. Verify all Resend DNS records are present in Cloudflare
  const allRecords = await cf(`/zones/${zone.id}/dns_records?per_page=100`);
  const records = allRecords.result ?? [];
  results.resendDNS = {
    dkim: records.find((r: { name: string }) => r.name === "resend._domainkey.lwnetwork.org") ? "present" : "missing",
    spfTXT: records.find((r: { name: string; type: string }) => r.name === "send.lwnetwork.org" && r.type === "TXT") ? "present" : "missing",
    mxSend: records.find((r: { name: string; type: string }) => r.name === "send.lwnetwork.org" && r.type === "MX") ? "present" : "missing",
  };

  results.nextStep = `Update Wix nameservers to: ${(zone.name_servers ?? []).join(" and ")}`;

  return NextResponse.json(results, { status: 200 });
}
