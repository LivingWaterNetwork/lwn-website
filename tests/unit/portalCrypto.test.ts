import { describe, expect, it } from "vitest";
import { constantTimeEqualHex, generateLoginCode, generateSessionToken, hmacHex } from "../../src/lib/portal/crypto";

describe("hmacHex", () => {
  it("is deterministic for the same secret and value", () => {
    expect(hmacHex("secret-a", "token-1")).toBe(hmacHex("secret-a", "token-1"));
  });

  it("changes when the secret changes — this is what makes secret rotation invalidate sessions", () => {
    const hashBefore = hmacHex("secret-a", "token-1");
    const hashAfter = hmacHex("secret-b", "token-1");
    expect(hashBefore).not.toBe(hashAfter);
  });

  it("changes when the value changes", () => {
    expect(hmacHex("secret-a", "token-1")).not.toBe(hmacHex("secret-a", "token-2"));
  });
});

describe("constantTimeEqualHex", () => {
  it("matches equal hex strings", () => {
    const h = hmacHex("s", "v");
    expect(constantTimeEqualHex(h, h)).toBe(true);
  });

  it("rejects differing hex strings of the same length", () => {
    expect(constantTimeEqualHex(hmacHex("s", "v1"), hmacHex("s", "v2"))).toBe(false);
  });

  it("rejects differing lengths without throwing", () => {
    expect(constantTimeEqualHex("ab", "abcd")).toBe(false);
  });
});

describe("generateLoginCode", () => {
  it("always returns a 6-digit zero-padded string", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateLoginCode();
      expect(code).toMatch(/^\d{6}$/);
    }
  });
});

describe("generateSessionToken", () => {
  it("returns a unique, URL-safe token each call", () => {
    const tokens = new Set(Array.from({ length: 20 }, () => generateSessionToken()));
    expect(tokens.size).toBe(20);
    Array.from(tokens).forEach((token) => {
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });
});
