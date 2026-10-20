const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export type LoginAttemptState = {
  codeAttempts: number;
  lockedUntil: Date | null;
};

export type LoginAttemptDecision =
  | { outcome: "already_locked"; lockedUntil: Date }
  | { outcome: "success"; nextState: LoginAttemptState }
  | { outcome: "failed"; attemptsRemaining: number; nextState: LoginAttemptState }
  | { outcome: "failed_now_locked"; lockedUntil: Date; nextState: LoginAttemptState };

/**
 * Pure decision function for the access-code rate-limit/lockout state
 * machine — kept free of DB/crypto calls so it's directly unit-testable.
 * The caller is responsible for verifying the code itself (scrypt compare)
 * and persisting `nextState`.
 */
export function evaluateLoginAttempt(
  state: LoginAttemptState,
  codeMatches: boolean,
  now: Date = new Date()
): LoginAttemptDecision {
  if (state.lockedUntil && state.lockedUntil.getTime() > now.getTime()) {
    return { outcome: "already_locked", lockedUntil: state.lockedUntil };
  }

  if (codeMatches) {
    return { outcome: "success", nextState: { codeAttempts: 0, lockedUntil: null } };
  }

  const codeAttempts = state.codeAttempts + 1;
  if (codeAttempts >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(now.getTime() + LOCKOUT_MS);
    return { outcome: "failed_now_locked", lockedUntil, nextState: { codeAttempts, lockedUntil } };
  }

  return {
    outcome: "failed",
    attemptsRemaining: MAX_ATTEMPTS - codeAttempts,
    nextState: { codeAttempts, lockedUntil: null },
  };
}

export const ACCESS_CODE_MAX_ATTEMPTS = MAX_ATTEMPTS;
export const ACCESS_CODE_LOCKOUT_MS = LOCKOUT_MS;
