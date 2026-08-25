import { describe, expect, it } from "vitest";
import { extractClaims, isSupportedImport } from "../../src/lib/imports/extract";

const SAMPLE = `
Omar Fandino. Founder, Living Water Network. Contact: someone@example.test or (404) 555-0134.
He served as Associate Pastor of Discipleship from 2019 - 2022.
Bachelor of Arts in Ministry. He led 250 students and 40 volunteers.
More at https://example.test/about.
`;

describe("conservative claim extraction", () => {
  it("extracts contact details as claims, not as facts", () => {
    const claims = extractClaims(SAMPLE);
    const email = claims.find((c) => c.suggestedPath === "contact.email");
    expect(email).toBeDefined();
    expect(email!.suggestedValue).toBe("someone@example.test");
  });

  it("attaches a source excerpt to every claim so review is verifiable", () => {
    for (const c of extractClaims(SAMPLE)) {
      expect(c.excerpt.trim().length).toBeGreaterThan(0);
    }
  });

  it("flags numeric ministry metrics loudly rather than adopting them", () => {
    const metrics = extractClaims(SAMPLE).filter((c) => c.suggestedKind === "metric");
    expect(metrics.length).toBeGreaterThan(0);
    for (const m of metrics) {
      expect(m.claimText).toMatch(/UNVERIFIED METRIC/);
    }
  });

  it("finds role claims without asserting them", () => {
    const ministry = extractClaims(SAMPLE).filter((c) => c.suggestedKind === "ministry");
    expect(ministry.some((c) => /Founder/.test(c.claimText))).toBe(true);
  });

  it("finds education and date ranges as candidates for review", () => {
    const claims = extractClaims(SAMPLE);
    expect(claims.some((c) => c.suggestedKind === "education")).toBe(true);
    expect(claims.some((c) => c.suggestedKind === "employment")).toBe(true);
  });

  it("returns nothing for text with no candidate signals", () => {
    expect(extractClaims("The weather today is mild and the sky is clear")).toHaveLength(0);
  });

  it("does not duplicate the same value twice", () => {
    const claims = extractClaims(`${SAMPLE}\n${SAMPLE}`);
    const emails = claims.filter((c) => c.suggestedPath === "contact.email");
    expect(emails).toHaveLength(1);
  });

  it("terminates on pathological input", () => {
    expect(() => extractClaims("a".repeat(50_000))).not.toThrow();
  });

  it("recognizes supported import types", () => {
    expect(isSupportedImport("resume.pdf")).toBe(true);
    expect(isSupportedImport("bylaws.docx")).toBe(true);
    expect(isSupportedImport("notes.md")).toBe(true);
    expect(isSupportedImport("photo.png")).toBe(false);
  });
});
