import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The site publishes no email address, telephone number, or postal address, and
// must never route Measure & Make's commercial inquiries to Living Water
// Network's nonprofit inbox. These are easy to reintroduce by accident, so they
// are pinned here rather than left to review.

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(path) ? [path] : [];
  });
}

const files = sourceFiles("src");

describe("public contact surface", () => {
  it("contains no lwnetwork.org email address anywhere in the app", () => {
    const offenders = files.filter((file) =>
      /[\w.]+@lwnetwork\.org/.test(readFileSync(file, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("uses no mailto: or tel: links", () => {
    const offenders = files.filter((file) =>
      /(mailto:|tel:)/.test(readFileSync(file, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("never abbreviates the brand name", () => {
    const offenders = files.filter((file) =>
      /\bM\s?&\s?M\b/.test(readFileSync(file, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("spells Radiant Events Planning correctly wherever it appears", () => {
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toMatch(/Radeen/i);
      if (/Radiant/.test(text)) {
        expect(text).toMatch(/Radiant Events Planning/);
      }
    }
  });
});
