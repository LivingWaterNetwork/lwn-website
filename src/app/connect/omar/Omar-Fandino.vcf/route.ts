import { buildVCard, VCARD_FILENAME } from "@/lib/connect/omar";

/**
 * Serves Omar's vCard at /connect/omar/Omar-Fandino.vcf.
 *
 * The route segment is named for the file so the download lands with the right
 * filename even in browsers that ignore Content-Disposition (notably iOS
 * Safari, which derives the name from the URL's last path segment).
 */

// Static content, no request-time data — prerender it once at build.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildVCard(), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${VCARD_FILENAME}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
