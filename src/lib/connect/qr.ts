import QRCode from "qrcode";

import { CANONICAL_URL } from "./omar";

/**
 * Deterministic, local QR generation for the digital business card.
 *
 * Runs on the server at build time (the /connect/omar page is statically
 * rendered), so the browser never calls a third-party QR image endpoint and the
 * modal has no network dependency once the page has loaded. The encoded payload
 * is the canonical URL and nothing else — never raw contact fields, never a
 * vCard- or meCard-encoded QR. The QR takes a scanner to the page; the page is
 * what offers the vCard download.
 */

/**
 * Error correction level M (~15% recoverable) over the short canonical URL keeps
 * the symbol coarse enough to survive a ~1in print, which a higher level's extra
 * modules would work against.
 */
const OPTIONS = {
  errorCorrectionLevel: "M",
  margin: 4, // Quiet zone: the QR spec's required 4-module minimum.
  color: {
    dark: "#0A2A47", // LWN navy — 14.5:1 on white, well past the 3:1 QR needs.
    light: "#FFFFFF", // Pure white, not the limestone card ground: scanners key
    // on module contrast, and the modal renders the code on its own white tile.
  },
} as const;

export type QrAssets = {
  /** Inline <svg> markup, used for on-screen render and the .svg download. */
  svg: string;
  /** data:image/png;base64 URI, used for the .png download. */
  pngDataUrl: string;
  /** The exact string encoded in both, for the plain-text fallback link. */
  encoded: string;
};

export async function generateQrAssets(
  value: string = CANONICAL_URL,
): Promise<QrAssets> {
  const [svg, pngDataUrl] = await Promise.all([
    QRCode.toString(value, { ...OPTIONS, type: "svg", width: 512 }),
    QRCode.toDataURL(value, { ...OPTIONS, width: 1024 }),
  ]);

  return { svg, pngDataUrl, encoded: value };
}
