import { NextRequest, NextResponse } from "next/server";
import sitemap from "@/app/sitemap";
import { submitUrlsToIndexNow } from "@/lib/indexnow";

/**
 * Manually-triggered endpoint (not on a Vercel cron schedule — this account's
 * cron slot is already used by send-thank-you-letters) that pushes every URL
 * in the sitemap to IndexNow, so Bing/Yandex/etc. pick up new or changed
 * pages within minutes instead of waiting on their own crawl schedule.
 *
 * Trigger it after a deploy that adds/changes pages, e.g.:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://lwnetwork.org/api/cron/indexnow
 *
 * Google does not participate in IndexNow — for Google, submit changes via
 * Search Console / rely on the sitemap, which this same route list is drawn from.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret) {
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn(
      "[cron/indexnow] CRON_SECRET is not set — this endpoint is running WITHOUT auth protection. Set CRON_SECRET in Vercel env vars before relying on this in production."
    );
  }

  const urls = sitemap().map((entry) => entry.url);
  await submitUrlsToIndexNow(urls);

  return NextResponse.json({ submitted: urls.length });
}
