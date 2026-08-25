/**
 * Browser automation safety rules.
 *
 * These are stop conditions, not warnings. When one fires, the run ends and a
 * human takes the keyboard. Nothing in this file, and nothing that calls it,
 * attempts to solve, click through, or work around a security control.
 */

export type StopReason =
  | "CAPTCHA_DETECTED"
  | "MFA_REQUIRED"
  | "SECURITY_VERIFICATION"
  | "LOGIN_REQUIRED"
  | "UNEXPECTED_ATTESTATION"
  | "THEOLOGICAL_AFFIRMATION"
  | "UNAPPROVED_ANSWER"
  | "LEGAL_DECLARATION"
  | "MATERIAL_UNCERTAINTY"
  | "SUBMIT_BUTTON_REACHED"
  | "NAVIGATION_ERROR";

export interface SafetyStop {
  reason: StopReason;
  message: string;
  /** What the candidate should do next. Always actionable. */
  humanAction: string;
}

/** DOM signatures of protections we must never touch. */
export const CAPTCHA_SELECTORS = [
  "iframe[src*='recaptcha']",
  "iframe[src*='hcaptcha']",
  "iframe[title*='challenge']",
  ".g-recaptcha",
  "#cf-challenge-running",
  "[data-sitekey]",
  "iframe[src*='turnstile']",
  "iframe[src*='arkoselabs']",
];

export const MFA_PATTERNS = [
  /verification code/i,
  /two[- ]factor/i,
  /authenticator app/i,
  /one[- ]time (?:pass)?code/i,
  /we (?:sent|texted|emailed) you a code/i,
  /security check/i,
  /confirm (?:it'?s|its) you/i,
];

export const LOGIN_PATTERNS = [
  /sign in to (?:continue|apply)/i,
  /log ?in to (?:continue|apply)/i,
  /create an account to apply/i,
  /password/i,
];

export const LEGAL_PATTERNS = [
  /under penalty of perjury/i,
  /background check/i,
  /i (?:hereby )?(?:certify|attest|declare)/i,
  /authorize .{0,40}(?:verify|investigate)/i,
  /electronic signature/i,
  /terms (?:and|&) conditions/i,
];

export const THEOLOGICAL_AFFIRMATION_PATTERNS = [
  /statement of faith/i,
  /doctrinal statement/i,
  /articles of faith/i,
  /affirm .{0,40}(?:belief|doctrine|creed)/i,
  /church covenant/i,
];

/** Text on a control that would actually submit the application. */
export const SUBMIT_PATTERNS = [
  /^submit$/i,
  /submit application/i,
  /^apply(?: now)?$/i,
  /send application/i,
  /finish and submit/i,
];

export interface PageSnapshot {
  url: string;
  textContent: string;
  /** Selectors that matched on the page. */
  matchedSelectors: string[];
}

/**
 * Evaluate a page for stop conditions.
 *
 * Order matters: security controls are checked before anything else, so a page
 * that is both a login wall and a form is treated as a login wall.
 */
export function evaluatePage(snapshot: PageSnapshot): SafetyStop | null {
  const { textContent, matchedSelectors } = snapshot;

  if (matchedSelectors.some((s) => CAPTCHA_SELECTORS.includes(s))) {
    return {
      reason: "CAPTCHA_DETECTED",
      message: "A CAPTCHA or bot-challenge widget is present on this page.",
      humanAction:
        "The browser is left open and paused. Complete the challenge yourself, then re-run with --resume. The agent will not attempt it.",
    };
  }

  if (MFA_PATTERNS.some((p) => p.test(textContent))) {
    return {
      reason: "MFA_REQUIRED",
      message: "This page is asking for a verification code or second factor.",
      humanAction: "Complete the verification in the open browser window. The agent does not handle credentials or codes.",
    };
  }

  if (LOGIN_PATTERNS.some((p) => p.test(textContent))) {
    return {
      reason: "LOGIN_REQUIRED",
      message: "This site requires an authenticated session before the application can proceed.",
      humanAction:
        "Sign in yourself in the open browser window. The agent never enters credentials and never drives an authenticated session on your behalf without you present.",
    };
  }

  if (THEOLOGICAL_AFFIRMATION_PATTERNS.some((p) => p.test(textContent))) {
    return {
      reason: "THEOLOGICAL_AFFIRMATION",
      message: "This page asks you to affirm a statement of faith, doctrinal statement, or church covenant.",
      humanAction:
        "Read the statement in full and decide for yourself. The agent will not affirm doctrine on your behalf under any circumstances.",
    };
  }

  if (LEGAL_PATTERNS.some((p) => p.test(textContent))) {
    return {
      reason: "LEGAL_DECLARATION",
      message: "This page contains a legal declaration, certification, or background-check consent.",
      humanAction: "Read and complete this yourself. The agent does not sign or certify anything.",
    };
  }

  return null;
}

/** Whether a control is the real submit button. Used to stop *before* it. */
export function isSubmitControl(label: string): boolean {
  return SUBMIT_PATTERNS.some((p) => p.test(label.trim()));
}

/** Human-readable explanation of every stop reason, for the dashboard. */
export const STOP_REASON_COPY: Record<StopReason, string> = {
  CAPTCHA_DETECTED: "Stopped at a CAPTCHA. Never bypassed.",
  MFA_REQUIRED: "Stopped at multi-factor authentication.",
  SECURITY_VERIFICATION: "Stopped at a security verification step.",
  LOGIN_REQUIRED: "Stopped at a login wall.",
  UNEXPECTED_ATTESTATION: "Stopped at an unexpected attestation.",
  THEOLOGICAL_AFFIRMATION: "Stopped at a doctrinal affirmation.",
  UNAPPROVED_ANSWER: "Stopped: a form question has no approved answer.",
  LEGAL_DECLARATION: "Stopped at a legal declaration.",
  MATERIAL_UNCERTAINTY: "Stopped: the agent was not confident enough to proceed.",
  SUBMIT_BUTTON_REACHED: "Stopped at the submit button. Submission requires your approval.",
  NAVIGATION_ERROR: "Stopped: the page could not be loaded or navigated.",
};
