import { describe, expect, it } from "vitest";
import { evaluateLoginAttempt, ACCESS_CODE_MAX_ATTEMPTS, ACCESS_CODE_LOCKOUT_MS } from "@/lib/agreements/access";

const now = new Date("2026-10-20T12:00:00Z");

describe("evaluateLoginAttempt", () => {
  it("succeeds and resets attempts on a correct code", () => {
    const result = evaluateLoginAttempt({ codeAttempts: 2, lockedUntil: null }, true, now);
    expect(result.outcome).toBe("success");
    if (result.outcome === "success") {
      expect(result.nextState).toEqual({ codeAttempts: 0, lockedUntil: null });
    }
  });

  it("increments attempts on a wrong code and reports how many remain", () => {
    const result = evaluateLoginAttempt({ codeAttempts: 0, lockedUntil: null }, false, now);
    expect(result.outcome).toBe("failed");
    if (result.outcome === "failed") {
      expect(result.attemptsRemaining).toBe(ACCESS_CODE_MAX_ATTEMPTS - 1);
    }
  });

  it("locks the agreement for 15 minutes on the 5th consecutive failure", () => {
    const result = evaluateLoginAttempt({ codeAttempts: ACCESS_CODE_MAX_ATTEMPTS - 1, lockedUntil: null }, false, now);
    expect(result.outcome).toBe("failed_now_locked");
    if (result.outcome === "failed_now_locked") {
      expect(result.lockedUntil.getTime()).toBe(now.getTime() + ACCESS_CODE_LOCKOUT_MS);
    }
  });

  it("refuses even a correct code while already locked out", () => {
    const lockedUntil = new Date(now.getTime() + 60_000);
    const result = evaluateLoginAttempt({ codeAttempts: 5, lockedUntil }, true, now);
    expect(result.outcome).toBe("already_locked");
  });

  it("accepts a correct code again once the lockout window has passed", () => {
    const lockedUntil = new Date(now.getTime() - 1000); // already expired
    const result = evaluateLoginAttempt({ codeAttempts: 5, lockedUntil }, true, now);
    expect(result.outcome).toBe("success");
  });
});
