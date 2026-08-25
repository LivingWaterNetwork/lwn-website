import { describe, expect, it } from "vitest";
import {
  CAPTCHA_SELECTORS,
  evaluatePage,
  isSubmitControl,
  STOP_REASON_COPY,
} from "../../browser/safety";

const snap = (text: string, selectors: string[] = []) => ({
  url: "https://example.test/apply",
  textContent: text,
  matchedSelectors: selectors,
});

describe("browser safety stops", () => {
  it("stops on a CAPTCHA and never attempts it", () => {
    const stop = evaluatePage(snap("Please verify you are human", [CAPTCHA_SELECTORS[0]!]));
    expect(stop?.reason).toBe("CAPTCHA_DETECTED");
    expect(stop?.humanAction).toMatch(/will not attempt/i);
  });

  it("stops on each CAPTCHA vendor signature", () => {
    for (const sel of CAPTCHA_SELECTORS) {
      expect(evaluatePage(snap("anything", [sel]))?.reason).toBe("CAPTCHA_DETECTED");
    }
  });

  it("stops on MFA", () => {
    for (const t of [
      "Enter the verification code we sent you",
      "Open your authenticator app",
      "Two-factor authentication required",
    ]) {
      expect(evaluatePage(snap(t))?.reason).toBe("MFA_REQUIRED");
    }
  });

  it("stops at a login wall rather than entering credentials", () => {
    const stop = evaluatePage(snap("Please sign in to continue with your application"));
    expect(stop?.reason).toBe("LOGIN_REQUIRED");
    expect(stop?.humanAction).toMatch(/never enters credentials/i);
  });

  it("stops on a statement of faith affirmation", () => {
    const stop = evaluatePage(snap("Please read and affirm our Statement of Faith below."));
    expect(stop?.reason).toBe("THEOLOGICAL_AFFIRMATION");
    expect(stop?.humanAction).toMatch(/will not affirm doctrine/i);
  });

  it("stops on a church covenant", () => {
    expect(evaluatePage(snap("I agree to the church covenant."))?.reason).toBe("THEOLOGICAL_AFFIRMATION");
  });

  it("stops on legal declarations and background-check consent", () => {
    expect(evaluatePage(snap("I certify under penalty of perjury"))?.reason).toBe("LEGAL_DECLARATION");
    expect(evaluatePage(snap("Consent to a background check"))?.reason).toBe("LEGAL_DECLARATION");
  });

  it("prioritizes the security control when a page is both a wall and a form", () => {
    const stop = evaluatePage(snap("Sign in to continue. Then affirm our statement of faith.", [CAPTCHA_SELECTORS[0]!]));
    expect(stop?.reason).toBe("CAPTCHA_DETECTED");
  });

  it("allows an ordinary application page through", () => {
    expect(evaluatePage(snap("Tell us about your ministry experience. Describe your calling."))).toBeNull();
  });

  it("recognizes submit controls so the run can stop before them", () => {
    for (const label of ["Submit", "Submit Application", "Apply Now", "Send Application", "  submit  "]) {
      expect(isSubmitControl(label)).toBe(true);
    }
  });

  it("does not mistake navigation for submission", () => {
    for (const label of ["Save Draft", "Next", "Back", "Cancel", "Save and continue later"]) {
      expect(isSubmitControl(label)).toBe(false);
    }
  });

  it("has human-readable copy for every stop reason", () => {
    for (const [reason, copy] of Object.entries(STOP_REASON_COPY)) {
      expect(copy.length).toBeGreaterThan(10);
      expect(reason).toMatch(/^[A-Z_]+$/);
    }
  });
});
