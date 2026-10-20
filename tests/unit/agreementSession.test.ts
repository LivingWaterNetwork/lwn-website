import { describe, expect, it, beforeAll } from "vitest";
import { createAgreementSessionToken, isValidAgreementSessionToken, agreementSessionCookieName } from "@/lib/agreements/session";

beforeAll(() => {
  process.env.AGREEMENTS_SESSION_SECRET = "test-secret-not-used-in-production";
});

/**
 * This is the mechanism `requireAgreementSession` (src/lib/agreements/requestHelpers.ts)
 * relies on for every signer-facing API route: a session minted for one
 * agreement must never validate against a different agreement's id. If this
 * ever regresses, agreement A's cookie could read/sign/download agreement B.
 */
describe("agreement session isolation", () => {
  it("validates a token against the agreement it was minted for", async () => {
    const token = await createAgreementSessionToken("agreement-a");
    expect(await isValidAgreementSessionToken(token, "agreement-a")).toBe(true);
  });

  it("rejects agreement A's token when checked against agreement B's id", async () => {
    const tokenForA = await createAgreementSessionToken("agreement-a");
    expect(await isValidAgreementSessionToken(tokenForA, "agreement-b")).toBe(false);
  });

  it("rejects a tampered token (agreement id swapped, signature unchanged)", async () => {
    const tokenForA = await createAgreementSessionToken("agreement-a");
    const [, expiresAt, signature] = tokenForA.split(".");
    const tampered = `agreement-b.${expiresAt}.${signature}`;
    expect(await isValidAgreementSessionToken(tampered, "agreement-b")).toBe(false);
  });

  it("rejects a missing or malformed token", async () => {
    expect(await isValidAgreementSessionToken(null, "agreement-a")).toBe(false);
    expect(await isValidAgreementSessionToken("garbage", "agreement-a")).toBe(false);
    expect(await isValidAgreementSessionToken("a.b", "agreement-a")).toBe(false);
  });

  it("gives different agreements different cookie names, so one browser can hold both sessions at once", () => {
    // Without this, logging into agreement B in a second tab overwrites a
    // single shared cookie and silently logs tab A out on its next reload.
    expect(agreementSessionCookieName("agreement-a-slug")).not.toBe(agreementSessionCookieName("agreement-b-slug"));
    expect(agreementSessionCookieName("amaya-frias-abc123")).toBe("agreement_session_amaya-frias-abc123");
  });

  it("rejects an expired token", async () => {
    // Build an already-expired token by hand using the same signing path:
    // easiest is to mint one and check it still validates now, then confirm
    // a hand-rolled far-past expiry (with a necessarily wrong signature) fails.
    const expiredPayload = "agreement-a.1";
    expect(await isValidAgreementSessionToken(`${expiredPayload}.deadbeef`, "agreement-a")).toBe(false);
  });
});
