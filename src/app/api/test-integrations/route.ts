/**
 * GET /api/test-integrations
 * Diagnostic endpoint — tests Airtable and Resend without side effects.
 * Hit this URL in your browser to see exactly what's failing.
 * DELETE THIS FILE once integrations are confirmed working.
 */
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  const results: Record<string, unknown> = {};

  // ── Env var presence check ──────────────────────────────────────────────────
  results.env = {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY ? "✅ set" : "❌ MISSING",
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID ? "✅ set" : "❌ MISSING",
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "✅ set" : "❌ MISSING",
    NOTIFY_EMAIL: process.env.NOTIFY_EMAIL ?? "(not set — will use info@lwnetwork.org)",
    DATABASE_URL: process.env.DATABASE_URL ? "✅ set" : "❌ MISSING",
  };

  // ── Airtable test ──────────────────────────────────────────────────────────
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    results.airtable = { status: "❌ skipped — env vars missing" };
  } else {
    try {
      // Try to list records (read-only) to confirm credentials + base ID work
      const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Cohort%20Applications?maxRecords=1`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
      });
      const body = await res.json();
      if (res.ok) {
        results.airtable = {
          status: "✅ credentials OK — table accessible",
          recordCount: body.records?.length ?? 0,
        };
      } else {
        results.airtable = {
          status: "❌ API error",
          httpStatus: res.status,
          error: body,
          hint:
            res.status === 401
              ? "Invalid API key — check AIRTABLE_API_KEY in Vercel"
              : res.status === 403
              ? "Token lacks permission — needs data.records:read on this base"
              : res.status === 404
              ? 'Table not found — make sure the table is named exactly "Cohort Applications"'
              : "Unknown error — see body above",
        };
      }
    } catch (err) {
      results.airtable = {
        status: "❌ fetch threw an exception",
        error: String(err),
      };
    }
  }

  // ── Resend test ─────────────────────────────────────────────────────────────
  if (!process.env.RESEND_API_KEY) {
    results.resend = { status: "❌ skipped — RESEND_API_KEY missing" };
  } else {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Check what domains are verified
      const domainsRes = await resend.domains.list();
      const domains = (domainsRes.data as { data?: { name: string; status: string }[] })?.data ?? [];
      const lwDomain = domains.find((d) => d.name === "lwnetwork.org");

      results.resend = {
        apiKey: "✅ valid",
        verifiedDomains: domains.map((d) => `${d.name} (${d.status})`),
        lwnetworkDomain: lwDomain
          ? `${lwDomain.status === "verified" ? "✅" : "⚠️"} lwnetwork.org is ${lwDomain.status}`
          : "❌ lwnetwork.org NOT found in Resend — domain not added or not verified",
        hint: !lwDomain
          ? "Go to resend.com/domains → Add Domain → lwnetwork.org → add the DNS records to your DNS provider → verify"
          : lwDomain.status !== "verified"
          ? "Domain is added but DNS records are not verified yet. Check your DNS provider."
          : null,
      };
    } catch (err) {
      results.resend = {
        status: "❌ Resend API call failed",
        error: String(err),
        hint: "RESEND_API_KEY may be invalid or expired",
      };
    }
  }

  // ── Write test ──────────────────────────────────────────────────────────────
  // Send a real test email to confirm end-to-end (only if Resend key is present)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const notifyTo = process.env.NOTIFY_EMAIL ?? "info@lwnetwork.org";
      const { error } = await resend.emails.send({
        from: "Living Water Network <info@lwnetwork.org>",
        to: notifyTo,
        subject: "✅ LWN Integration Test",
        text: "This is a test email from the /api/test-integrations diagnostic endpoint. If you received this, Resend is working correctly.",
      });
      results.resendTestEmail = error
        ? { status: "❌ send failed", error }
        : { status: `✅ test email sent to ${notifyTo}` };
    } catch (err) {
      results.resendTestEmail = { status: "❌ exception", error: String(err) };
    }
  }

  return NextResponse.json(results, { status: 200 });
}
