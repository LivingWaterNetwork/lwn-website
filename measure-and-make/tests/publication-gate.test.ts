import { describe, expect, it } from "vitest";
import {
  getFeaturedProjects,
  getProjectBySlug,
  getPublicProjectSlugs,
  getPublicProjects,
} from "@/content/projects";
import { SITE_URL } from "@/content/site";

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

describe("sitemap", () => {
  it("lists only static routes and approved project slugs", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = sitemap().map((entry) => entry.url);

    for (const slug of APPROVED_SLUGS) {
      expect(urls).toContain(`${SITE_URL}/work/${slug}`);
    }
    for (const slug of WITHHELD_SLUGS) {
      expect(urls.some((url) => url.includes(slug))).toBe(false);
    }
    // Placeholder legal pages stay out while they are still placeholder text.
    expect(urls.some((url) => url.endsWith("/privacy"))).toBe(false);
    expect(urls.some((url) => url.endsWith("/terms"))).toBe(false);
  });
});

// /work/[slug] cannot be imported here (the page is TSX and this suite runs
// without a JSX transform), but its generateStaticParams is a direct call to
// getPublicProjectSlugs(), which the first test above pins exactly.
