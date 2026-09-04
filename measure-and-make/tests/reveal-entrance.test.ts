import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Reveal wraps almost every heading and paragraph on the site. It must never
 * again be able to leave that content invisible.
 *
 * It used to be framer-motion `whileInView`: the wrapper was server-rendered at
 * opacity 0 and only animated up once an IntersectionObserver fired, so a
 * page's text depended on JavaScript loading, hydrating, and an observer
 * reporting. On production every page's title block was served at
 * `opacity:0;transform:translateY(16px)`, and three seconds after load with no
 * scrolling, 15 of 15 wrappers on the homepage were still at zero.
 *
 * These are source-level guards; scripts/qa.mjs section 10 checks the painted
 * result in a browser across every route. Everything below reads code with
 * comments stripped — the comments necessarily name what is being banned.
 */

/** Source with comments removed: /* … *\/, // …, and JSX {/* … *\/}. */
function code(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/\{\s*\}/g, "");
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(path) ? [path] : [];
  });
}

const reveal = code(readFileSync("src/components/ui/Reveal.tsx", "utf8"));
const css = code(readFileSync("src/app/globals.css", "utf8"));

describe("Reveal's entrance", () => {
  it("uses no animation library and no client JavaScript", () => {
    expect(reveal).not.toContain("framer-motion");
    expect(reveal).not.toContain("use client");
    expect(reveal).not.toContain("IntersectionObserver");
    expect(reveal).not.toContain("whileInView");
  });

  it("is gone from the whole app, not just from Reveal", () => {
    const offenders = sourceFiles("src").filter((file) =>
      /framer-motion|whileInView|IntersectionObserver/.test(
        code(readFileSync(file, "utf8")),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("is not a dependency of the app any more", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(Object.keys(pkg.dependencies ?? {})).not.toContain("framer-motion");
  });

  it("sets no inline opacity or transform in the server HTML", () => {
    // The stagger custom property is the only inline style it may write.
    expect(reveal).toContain("--mm-reveal-delay");
    expect(reveal).not.toMatch(/opacity/);
    expect(reveal).not.toMatch(/translateY|transform:/);
  });

  it("keeps the hidden state inside the keyframes and nowhere else", () => {
    // This is the property that makes the entrance safe: if the animation
    // cannot run, the content is visible rather than stranded at zero.
    const staticRules = css
      .split("}")
      .filter(
        (block) =>
          block.includes("[data-reveal]") && /opacity:\s*0\b/.test(block),
      );
    expect(staticRules).toEqual([]);
  });

  it("is gated on nothing that has to fire, and reads no scroll position", () => {
    // The class of bug, stated as a rule: an entrance whose finished state
    // depends on an event is an entrance that can fail to finish. An observer
    // callback, a wheel gesture and a scroll-position read are the same defect
    // wearing different clothes, so all of them are banned across the app
    // rather than only in Reveal.
    //
    // requestAnimationFrame is deliberately NOT on this list. A frame callback
    // cannot gate anything on visibility by itself, and ContactForm uses one
    // for a real accessibility reason — moving focus to the status region after
    // a submit, once React has committed it. Banning that would trade an
    // accessibility feature for nothing. What makes rAF dangerous is pairing it
    // with a position read, which the next assertion covers.
    const gated =
      /IntersectionObserver|whileInView|addEventListener\(\s*["'`](?:scroll|wheel|touchmove|mousewheel)|onScroll=|scrollIntoView|window\.scrollTo|\.scrollY|\.scrollTop|getBoundingClientRect/;
    const offenders = sourceFiles("src").filter((file) =>
      gated.test(code(readFileSync(file, "utf8"))),
    );
    expect(offenders).toEqual([]);
  });

  it("never pairs a frame callback with a geometry read", () => {
    // rAF is allowed on its own; a rAF that measures where something is on
    // screen is a hand-rolled IntersectionObserver, which is the banned thing
    // rebuilt by hand.
    const offenders = sourceFiles("src").filter((file) => {
      const body = code(readFileSync(file, "utf8"));
      return (
        /requestAnimationFrame/.test(body) &&
        /getBoundingClientRect|\.scrollY|\.scrollTop|innerHeight|offsetTop/.test(
          body,
        )
      );
    });
    expect(offenders).toEqual([]);
  });

  it("has a browser check that measures the painted result without scrolling", () => {
    // The guards above read source. Source can be right while the thing a
    // visitor actually receives is wrong — that is exactly what happened here:
    // the branch was already CSS-only while the promoted deployment still
    // served framer-motion's inline opacity: 0 on every route, so testing the
    // canonical address reproduced a bug that no longer existed in the code.
    // scripts/qa.mjs section 10 is the check that can tell those two apart, and
    // these assertions keep it honest.
    const qa = readFileSync("scripts/qa.mjs", "utf8");
    const section = qa.slice(
      qa.indexOf("// 10. Every route's content settles"),
    );
    expect(section.length).toBeGreaterThan(500);

    // It must be pointable at a deployment, not just at localhost — otherwise
    // there is no way to check what a given deployment serves.
    expect(qa).toContain("process.env.QA_BASE");

    // It must refuse to report success if the page moved during the check. A
    // check that scrolls first would pass against a scroll-gated entrance.
    expect(section).toContain("scrolls");
    expect(section).toMatch(/scrollY !== 0/);

    // And it must not itself scroll, click, hover or focus between load and
    // the read. Comments are stripped so the prose describing the ban does not
    // satisfy the ban.
    const body = code(section);
    for (const forbidden of [
      "mouse.wheel",
      "scrollIntoView",
      "window.scrollTo",
      ".click(",
      ".hover(",
      ".focus(",
      "keyboard.press",
    ]) {
      expect(body).not.toContain(forbidden);
    }
  });

  it("animates only when motion is welcome, and ends fully settled", () => {
    const gate = css
      .slice(css.indexOf("@media (prefers-reduced-motion: no-preference)"))
      .slice(0, 400);
    expect(gate).toContain("[data-reveal]");
    expect(gate).toContain("mm-reveal-in");

    const frames = css.slice(css.indexOf("@keyframes mm-reveal-in"));
    const from = frames.slice(frames.indexOf("from {"), frames.indexOf("to {"));
    const to = frames.slice(
      frames.indexOf("to {"),
      frames.indexOf("}", frames.indexOf("to {")),
    );
    expect(from).toContain("opacity: 0");
    expect(to).toContain("opacity: 1");
    expect(to).toContain("transform: none");
  });
});
