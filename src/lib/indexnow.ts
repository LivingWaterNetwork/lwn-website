const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lwnetwork.org";

/**
 * IndexNow key — proves site ownership by being hosted at /<key>.txt (see
 * public/<key>.txt). This is a verification token, not a secret, so it's
 * safe to default it here; override via INDEXNOW_KEY if it's ever rotated
 * (and rename the public/<key>.txt file to match).
 */
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? "31cc5b82785171cc67aa59f6b7e0761a";

/**
 * Pushes a batch of URLs to the IndexNow API (https://www.indexnow.org), which
 * fans out to every participating search engine — Bing, Yandex, Naver, Seznam,
 * and others. Google does not participate in IndexNow as of 2026; for Google,
 * an accurate sitemap + Search Console remains the mechanism (see README).
 *
 * Best-effort: failures are logged, never thrown, since this is a nice-to-have
 * indexing accelerant, not something that should break a deploy or a cron run.
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<void> {
  if (urls.length === 0) return;

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
    if (!res.ok) {
      console.error(`[indexnow] submission failed: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error("[indexnow] submission error:", err);
  }
}
