import { describe, expect, it } from "vitest";
import { hashSecret, verifySecret, generateAccessCode, generateAgreementSlug, sha256Hex } from "@/lib/agreements/crypto";

describe("hashSecret / verifySecret", () => {
  it("verifies the correct secret and rejects a wrong one", async () => {
    const hash = await hashSecret("ABCD1234");
    expect(await verifySecret("ABCD1234", hash)).toBe(true);
    expect(await verifySecret("WRONGCODE", hash)).toBe(false);
  });

  it("never stores the plaintext in the hash output", async () => {
    const hash = await hashSecret("SUPERSECRET1");
    expect(hash).not.toContain("SUPERSECRET1");
  });

  it("rejects malformed stored hashes instead of throwing", async () => {
    expect(await verifySecret("anything", "not-a-real-hash")).toBe(false);
    expect(await verifySecret("anything", null)).toBe(false);
  });
});

describe("generateAccessCode", () => {
  const ALLOWED = new Set("23456789ABCDEFGHJKMNPQRSTUVWXYZ".split(""));

  it("only uses the unambiguous alphabet (no 0/O/1/I/L)", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateAccessCode();
      expect(code).toHaveLength(8);
      expect(code).not.toMatch(/[01OIL]/);
      expect(code.split("").every((ch) => ALLOWED.has(ch))).toBe(true);
    }
  });
});

describe("generateAgreementSlug", () => {
  it("slugifies the name and appends random hex, never reusing the same suffix twice in a row", () => {
    const a = generateAgreementSlug("Amaya Frias");
    const b = generateAgreementSlug("Amaya Frias");
    expect(a).toMatch(/^amaya-frias-[0-9a-f]{8}$/);
    expect(a).not.toBe(b); // astronomically unlikely to collide
  });

  it("falls back to a safe base for a name with no alphanumeric characters", () => {
    expect(generateAgreementSlug("!!!")).toMatch(/^agreement-[0-9a-f]{8}$/);
  });
});

describe("sha256Hex", () => {
  it("is deterministic", () => {
    expect(sha256Hex("hello")).toBe(sha256Hex("hello"));
    expect(sha256Hex("hello")).not.toBe(sha256Hex("Hello"));
  });
});
