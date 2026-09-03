import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * The homepage hero must not depend on JavaScript to become visible.
 *
 * It used to be wrapped in Reveal, which is framer-motion `whileInView`: the
 * element is server-rendered at opacity 0 and only animated up once an
 * IntersectionObserver fires. Above the fold that is the wrong trade — the
 * first impression is one observer callback away from never finishing, it
 * stacks with the first-load reveal's own stagger, and with JavaScript off the
 * hero never appears at all.
 *
 * The hero's entrance is now CSS only, and only while the first-load reveal is
 * actually playing. These are source-level guards; scripts/qa.mjs checks the
 * painted result in a browser.
 */

const page = readFileSync("src/app/page.tsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

// The hero is the first section on the page; the next comment marker ends it.
const hero = page.slice(
  page.indexOf("{/* Hero."),
  page.indexOf("{/* Why Measure & Make */}"),
);

describe("the homepage hero's entrance", () => {
  it("is a recognisable block in the page source", () => {
    expect(hero.length).toBeGreaterThan(200);
    expect(hero).toContain("data-mm-hero");
    expect(hero).toContain("{home.headline}");
  });

  it("is not wrapped in Reveal, so no observer gates the first impression", () => {
    expect(hero).not.toContain("<Reveal");
  });

  it("carries no opacity or transform utility that could hide it", () => {
    expect(hero).not.toMatch(/className="[^"]*\bopacity-0\b/);
    expect(hero).not.toMatch(/className="[^"]*\b(translate-y|scale)-/);
  });

  it("only animates while the first-load reveal is playing", () => {
    // The stagger rule is gated on the attribute, so a later page view, a
    // reduced-motion visitor, and a visitor with JavaScript off all get the
    // hero at full strength with no animation applied at all.
    expect(css).toMatch(
      /:root\[data-mm-intro="play"\]\s*\[data-mm-hero\]\s*>\s*\*\s*\{/,
    );
    // And there is no ungated rule that could animate it outside that.
    const ungated = css
      .split("\n")
      .filter(
        (line) =>
          line.includes("[data-mm-hero]") &&
          !line.includes('data-mm-intro="play"'),
      );
    expect(ungated).toEqual([]);
  });

  it("ends its entrance keyframes fully opaque and untransformed", () => {
    const frames = css.slice(css.indexOf("@keyframes mm-hero-in"));
    const to = frames.slice(
      frames.indexOf("to {"),
      frames.indexOf("}", frames.indexOf("to {")),
    );
    expect(to).toContain("opacity: 1");
    expect(to).toContain("transform: none");
  });
});
