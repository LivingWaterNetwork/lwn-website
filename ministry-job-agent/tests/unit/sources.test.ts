import { describe, expect, it } from "vitest";
import {
  DISCOVERY_SOURCES,
  mayDraftApplication,
  mayReadListings,
} from "../../src/lib/discovery/sources";

/**
 * Reading a listing and submitting through a site are different acts. They were
 * originally one policy field, and collapsing them cost real coverage: the
 * search firms were marked manual-only because automated *submission* is
 * inappropriate there, which was never a reason not to *read* their listings.
 */
describe("source access policies", () => {
  it("fails closed on an unknown source", () => {
    expect(mayReadListings("no-such-source")).toBe(false);
    expect(mayDraftApplication("no-such-source")).toBe(false);
  });

  it("never reads a source whose terms or responses forbid it", () => {
    for (const key of ["linkedin", "indeed", "churchstaffing", "churchjobs", "vanderbloemen", "google"]) {
      expect(mayReadListings(key), `${key} must not be read automatically`).toBe(false);
    }
  });

  it("never drafts an application through an account-gated site", () => {
    for (const key of ["linkedin", "indeed", "churchstaffing", "ziprecruiter"]) {
      expect(mayDraftApplication(key), `${key} must not be auto-drafted`).toBe(false);
    }
  });

  it("allows reading the boards that publish listings openly", () => {
    for (const key of ["denominational_board", "justchurchjobs", "ministryhub", "church_site", "manual"]) {
      expect(mayReadListings(key), `${key} should be readable`).toBe(true);
    }
  });

  it("allows per-posting reads where only the index blocks automation", () => {
    expect(mayReadListings("chemistrystaffing")).toBe(true);
    // Reading is fine; applying still goes through their placement process.
    expect(mayDraftApplication("chemistrystaffing")).toBe(false);
  });

  it("keeps a readable source from becoming an auto-applyable one", () => {
    const readableButNotApplyable = DISCOVERY_SOURCES.filter(
      (s) => mayReadListings(s.key) && !mayDraftApplication(s.key),
    );
    expect(readableButNotApplyable.length).toBeGreaterThan(0);
  });

  it("records what was observed for every source we found blocked", () => {
    for (const s of DISCOVERY_SOURCES) {
      if (s.discoveryPolicy === "MANUAL_ONLY" && s.observed) {
        expect(s.observed).toMatch(/403|404|JavaScript|no listings|Forbidden/i);
      }
      expect(s.policyNote.length).toBeGreaterThan(30);
    }
  });

  it("has a disabled flag that overrides a permissive policy", () => {
    const disabled = DISCOVERY_SOURCES.filter((s) => !s.enabled);
    for (const s of disabled) {
      expect(mayReadListings(s.key)).toBe(false);
      expect(mayDraftApplication(s.key)).toBe(false);
    }
  });
});
