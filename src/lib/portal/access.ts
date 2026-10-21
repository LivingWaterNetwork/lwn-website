/**
 * Pure decision functions for portal login — no DB, no I/O, so they're
 * trivial to unit test exhaustively. Callers own persisting the resulting
 * state to `portal_login_challenges` / `portal_login_throttle`.
 */

export const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_VERIFY_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
export const MAX_CODE_REQUESTS_PER_HOUR = 5; // per email
export const THROTTLE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export interface ThrottleState {
  windowStart: Date;
  count: number;
  lockedUntil: Date | null;
}

export type ThrottleDecision =
  | { allowed: true; next: ThrottleState }
  | { allowed: false; reason: "locked" | "rate_limited"; next: ThrottleState };

/**
 * Per-email code-request throttle: at most MAX_CODE_REQUESTS_PER_HOUR
 * requests in a rolling hour window. Resets the window once it's elapsed.
 */
export function evaluateCodeRequestThrottle(state: ThrottleState | null, now: Date): ThrottleDecision {
  if (state?.lockedUntil && state.lockedUntil.getTime() > now.getTime()) {
    return { allowed: false, reason: "locked", next: state };
  }

  const windowElapsed = !state || now.getTime() - state.windowStart.getTime() >= THROTTLE_WINDOW_MS;
  const current: ThrottleState = windowElapsed
    ? { windowStart: now, count: 0, lockedUntil: null }
    : { windowStart: state.windowStart, count: state.count, lockedUntil: null };

  if (current.count >= MAX_CODE_REQUESTS_PER_HOUR) {
    return { allowed: false, reason: "rate_limited", next: current };
  }

  return { allowed: true, next: { ...current, count: current.count + 1 } };
}

export interface ChallengeState {
  attempts: number;
  expiresAt: Date;
  usedAt: Date | null;
}

export type VerifyDecision =
  | { outcome: "accepted" }
  | { outcome: "expired" }
  | { outcome: "already_used" }
  | { outcome: "locked_out"; lockedUntil: Date }
  | { outcome: "wrong_code"; attempts: number; lockedUntil: Date | null };

/**
 * Evaluates one code-verification attempt against a challenge. Mirrors the
 * Agreements evaluateLoginAttempt shape: a pure function the caller feeds
 * the current row state and gets back the next state plus what to tell the
 * user — "If that email has an LWN account, the code or link didn't match"
 * either way, so an attacker can't distinguish a wrong code from an
 * unknown email from the outside.
 */
export function evaluateCodeVerifyAttempt(
  state: ChallengeState,
  codeMatches: boolean,
  now: Date,
  existingLockout: Date | null
): VerifyDecision {
  if (existingLockout && existingLockout.getTime() > now.getTime()) {
    return { outcome: "locked_out", lockedUntil: existingLockout };
  }
  if (state.usedAt) return { outcome: "already_used" };
  if (state.expiresAt.getTime() <= now.getTime()) return { outcome: "expired" };

  if (codeMatches) return { outcome: "accepted" };

  const attempts = state.attempts + 1;
  if (attempts >= MAX_VERIFY_ATTEMPTS) {
    return { outcome: "wrong_code", attempts, lockedUntil: new Date(now.getTime() + LOCKOUT_MS) };
  }
  return { outcome: "wrong_code", attempts, lockedUntil: null };
}
