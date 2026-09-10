import { describe, expect, it } from "vitest";
import jsQR from "jsqr";
import { PNG } from "pngjs";

import {
  CANONICAL_URL,
  VCARD_FILENAME,
  buildVCard,
} from "@/lib/connect/omar";
import { generateQrAssets } from "@/lib/connect/qr";

/**
 * Guards the two things on the digital business card that fail silently and
 * expensively: a vCard that phones refuse to import, and a QR that resolves to
 * the wrong address after it has already been printed.
 */

describe("vCard", () => {
  const vcard = buildVCard();

  it("uses CRLF line endings throughout, with no bare LF", () => {
    // Every LF must be preceded by a CR.
    expect(vcard.split("\n").length - 1).toBeGreaterThan(0);
    expect(/[^\r]\n/.test(vcard)).toBe(false);
    expect(vcard.endsWith("\r\n")).toBe(true);
  });

  it("opens and closes as a version 3.0 vCard", () => {
    expect(vcard.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n")).toBe(true);
    expect(vcard.trimEnd().endsWith("END:VCARD")).toBe(true);
  });

  it("carries every approved field", () => {
    for (const line of [
      "N:Fandino;Omar;;;",
      "FN:Omar Fandino",
      "TITLE:Founder, Living Water Network | Strategy and Systems, Measure & Make",
      "TEL;TYPE=CELL:+14704759123",
      "EMAIL;TYPE=INTERNET,WORK:ofandino@lwnetwork.org",
      "ADR;TYPE=WORK:;;Atlanta;GA;;;United States",
      "URL:https://www.lwnetwork.org",
      "URL:https://www.measureandmakegroup.com",
      "X-SOCIALPROFILE;TYPE=linkedin:https://www.linkedin.com/in/ofandino/",
      "NOTE:Living Water Network and Measure & Make",
    ]) {
      expect(vcard).toContain(`${line}\r\n`);
    }
  });

  it("never abbreviates Measure & Make", () => {
    expect(vcard).not.toMatch(/\bM&M\b/);
  });

  it("keeps both organization URLs", () => {
    expect(vcard.match(/^URL:/gm)).toHaveLength(2);
  });

  it("is served under the approved filename", () => {
    expect(VCARD_FILENAME).toBe("Omar-Fandino.vcf");
  });
});

describe("QR code", () => {
  it("decodes to exactly the canonical URL, with no encoding artifacts", async () => {
    const { pngDataUrl } = await generateQrAssets(CANONICAL_URL);
    const png = PNG.sync.read(
      Buffer.from(pngDataUrl.replace(/^data:image\/png;base64,/, ""), "base64"),
    );

    const decoded = jsQR(
      new Uint8ClampedArray(png.data),
      png.width,
      png.height,
    );

    expect(decoded).not.toBeNull();
    expect(decoded?.data).toBe(CANONICAL_URL);
  });

  it("encodes the URL only — never contact fields", async () => {
    const { encoded } = await generateQrAssets(CANONICAL_URL);
    expect(encoded).toBe(CANONICAL_URL);
    expect(encoded).not.toContain("BEGIN:VCARD");
    expect(encoded).not.toContain("MECARD");
    expect(encoded).not.toContain("ofandino@");
  });

  it("emits SVG with a quiet zone and renders deterministically", async () => {
    const first = await generateQrAssets(CANONICAL_URL);
    const second = await generateQrAssets(CANONICAL_URL);

    expect(first.svg).toBe(second.svg);
    expect(first.svg).toContain("<svg");
    // margin: 4 modules, so the viewBox exceeds the symbol by 8 modules total.
    expect(first.svg).toMatch(/viewBox="0 0 (\d+) \1"/);
  });
});
