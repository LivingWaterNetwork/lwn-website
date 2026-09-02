import { describe, expect, it } from "vitest";
import {
  getFeaturedProjects,
  getProjectBySlug,
  getPublicProjectSlugs,
  getPublicProjects,
} from "@/content/projects";

// The publication gate is the one rule that overrides everything else in this
// build (07-DEVELOPER-CONTENT-MAP.md). These tests fail loudly if a record ever
// becomes reachable that shouldn't be.

const APPROVED_SLUGS = [
  "living-water-network-digital-platform",
  "young-adults-network-platform",
  "organizational-operating-system",
];

const WITHHELD_SLUGS = ["radiant-events-planning", "estate-cleanout-services"];

describe("the publication gate", () => {
  it("exposes exactly the three approved records, in display order", () => {
    expect(getPublicProjectSlugs()).toEqual(APPROVED_SLUGS);
  });

  it("only ever exposes Public records whose approval status starts with Approved", () => {
    for (const project of getPublicProjects()) {
      expect(project.visibility).toBe("Public");
      expect(project.publicationApprovalStatus.startsWith("Approved")).toBe(true);
    }
  });

  it("treats a Draft or Private slug exactly like a slug that does not exist", () => {
    for (const slug of WITHHELD_SLUGS) {
      expect(getProjectBySlug(slug)).toBeUndefined();
    }
    expect(getProjectBySlug("no-such-project")).toBeUndefined();
  });

  it("returns only approved records as featured", () => {
    const featured = getFeaturedProjects();
    expect(featured.length).toBeGreaterThan(0);
    for (const project of featured) {
      expect(APPROVED_SLUGS).toContain(project.slug);
      expect(project.featured).toBe(true);
    }
  });
});

describe("brand rules that are easy to break in code", () => {
  it("never abbreviates the name in any exposed project text", () => {
    const text = JSON.stringify(getPublicProjects());
    expect(text).not.toMatch(/\bM\s?&\s?M\b/);
  });
});
