import { describe, expect, it } from "vitest";
import {
  evaluateCodeRequestThrottle,
  evaluateCodeVerifyAttempt,
  LOCKOUT_MS,
  MAX_CODE_REQUESTS_PER_HOUR,
  MAX_VERIFY_ATTEMPTS,
} from "../../src/lib/portal/access";

describe("evaluateCodeRequestThrottle", () => {
  it("allows the first request with no prior state", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const decision = evaluateCodeRequestThrottle(null, now);
    expect(decision.allowed).toBe(true);
    expect(decision.next.count).toBe(1);
  });

  it("allows up to MAX_CODE_REQUESTS_PER_HOUR within the window", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    let state = { windowStart: now, count: 0, lockedUntil: null as Date | null };
    for (let i = 0; i < MAX_CODE_REQUESTS_PER_HOUR; i++) {
      const decision = evaluateCodeRequestThrottle(state, now);
      expect(decision.allowed).toBe(true);
      state = decision.next;
    }
    const over = evaluateCodeRequestThrottle(state, now);
    expect(over.allowed).toBe(false);
    if (!over.allowed) expect(over.reason).toBe("rate_limited");
  });

  it("resets the window once it has elapsed", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const state = { windowStart: start, count: MAX_CODE_REQUESTS_PER_HOUR, lockedUntil: null };
    const later = new Date(start.getTime() + 61 * 60 * 1000);
    const decision = evaluateCodeRequestThrottle(state, later);
    expect(decision.allowed).toBe(true);
    expect(decision.next.count).toBe(1);
  });

  it("stays locked until lockedUntil passes", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const state = { windowStart: now, count: 1, lockedUntil: new Date(now.getTime() + 1000) };
    const decision = evaluateCodeRequestThrottle(state, now);
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) expect(decision.reason).toBe("locked");
  });
});

describe("evaluateCodeVerifyAttempt", () => {
  const baseState = (overrides: Partial<{ attempts: number; expiresAt: Date; usedAt: Date | null }> = {}) => ({
    attempts: 0,
    expiresAt: new Date("2026-01-01T00:10:00Z"),
    usedAt: null,
    ...overrides,
  });

  it("accepts a correct code", () => {
    const now = new Date("2026-01-01T00:05:00Z");
    const decision = evaluateCodeVerifyAttempt(baseState(), true, now, null);
    expect(decision.outcome).toBe("accepted");
  });

  it("rejects an expired challenge even with the right code", () => {
    const now = new Date("2026-01-01T00:11:00Z");
    const decision = evaluateCodeVerifyAttempt(baseState(), true, now, null);
    expect(decision.outcome).toBe("expired");
  });

  it("rejects an already-used challenge", () => {
    const now = new Date("2026-01-01T00:05:00Z");
    const decision = evaluateCodeVerifyAttempt(baseState({ usedAt: new Date() }), true, now, null);
    expect(decision.outcome).toBe("already_used");
  });

  it("counts down wrong attempts and locks out at the limit", () => {
    const now = new Date("2026-01-01T00:05:00Z");
    let attempts = 0;
    for (let i = 1; i < MAX_VERIFY_ATTEMPTS; i++) {
      const decision = evaluateCodeVerifyAttempt(baseState({ attempts }), false, now, null);
      expect(decision.outcome).toBe("wrong_code");
      if (decision.outcome === "wrong_code") {
        expect(decision.lockedUntil).toBeNull();
        attempts = decision.attempts;
      }
    }
    const final = evaluateCodeVerifyAttempt(baseState({ attempts }), false, now, null);
    expect(final.outcome).toBe("wrong_code");
    if (final.outcome === "wrong_code") {
      expect(final.attempts).toBe(MAX_VERIFY_ATTEMPTS);
      expect(final.lockedUntil).not.toBeNull();
      expect(final.lockedUntil!.getTime()).toBe(now.getTime() + LOCKOUT_MS);
    }
  });

  it("honors an existing lockout regardless of code correctness", () => {
    const now = new Date("2026-01-01T00:05:00Z");
    const lockedUntil = new Date(now.getTime() + 60_000);
    const decision = evaluateCodeVerifyAttempt(baseState(), true, now, lockedUntil);
    expect(decision.outcome).toBe("locked_out");
  });

  it("treats an expired lockout as no lockout", () => {
    const now = new Date("2026-01-01T00:05:00Z");
    const pastLockout = new Date(now.getTime() - 1000);
    const decision = evaluateCodeVerifyAttempt(baseState(), true, now, pastLockout);
    expect(decision.outcome).toBe("accepted");
  });
});
