// Browser QA sweep. Run against a built site:
//
//   npm run build && npx next start -p 4330 &
//   node scripts/qa.mjs
//
// Checks every route at desktop, tablet, and mobile widths for console and
// hydration errors and horizontal overflow, then checks keyboard order and
// focus visibility, the mobile menu's disclosure behavior, reduced motion,
// accessible per-field form errors, that success is never shown without a
// confirmed write, that the brand lockups actually decode, and that the
// first-load brand reveal cannot trap focus, block input, stay stuck over the
// page, hold a reduced-motion visitor, or replay around the site, and that
// every route's content — not just the homepage hero — always settles fully
// opaque without anyone scrolling.
import { chromium } from "playwright";
const BASE = "http://localhost:4330/measure-and-make";
// /nope is the deliberate 404 check; its own 404 response is not a defect.
const ROUTES = [
  "",
  "/about",
  "/work",
  "/work/living-water-network-digital-platform",
  "/work/young-adults-network-platform",
  "/work/hand-of-life-renovations",
  "/work/redemption-cleanout-services",
  "/work/radiant-events-planning",
  "/work/organizational-operating-system",
  "/services",
  "/start",
  "/privacy",
  "/terms",
  "/nope",
];
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: [
    "--disable-background-networking",
    "--disable-component-update",
    "--no-first-run",
  ],
});
const problems = [];

// 1. Console + hydration errors, and horizontal overflow, on every route at 3 widths.
for (const [label, width, height] of [
  ["desktop", 1440, 900],
  ["tablet", 834, 1112],
  ["mobile", 390, 844],
]) {
  for (const route of ROUTES) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const msgs = [];
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning")
        msgs.push(`${m.type()}: ${m.text()}`);
    });
    page.on("pageerror", (e) => msgs.push(`pageerror: ${e.message}`));
    await page.route("**://*.google.com/**", (r) => r.abort());
    await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(900);
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth + 1
        ? {
            scrollWidth: document.documentElement.scrollWidth,
            inner: window.innerWidth,
          }
        : null,
    );
    if (overflow)
      problems.push(
        `[${label}] ${route || "/"} horizontal overflow ${JSON.stringify(overflow)}`,
      );
    const real = msgs
      .filter((m) => !/favicon|Download the React DevTools/i.test(m))
      .filter((m) => !(route === "/nope" && /404 \(Not Found\)/.test(m)));
    if (real.length)
      problems.push(`[${label}] ${route || "/"} console: ${real.join(" | ")}`);
    await page.close();
  }
}

// 2. Keyboard: skip link first, then reachable nav; mobile menu operable by keyboard.
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(BASE, { waitUntil: "load" });
  await page.keyboard.press("Tab");
  const first = await page.evaluate(() =>
    document.activeElement?.textContent?.trim(),
  );
  if (first !== "Skip to content")
    problems.push(`skip link is not the first tab stop (got: ${first})`);
  const ring = await page.evaluate(
    () =>
      getComputedStyle(document.activeElement).outlineStyle !== "none" ||
      getComputedStyle(document.activeElement).boxShadow !== "none",
  );
  if (!ring) problems.push("focused skip link has no visible focus indicator");
  const stops = [];
  for (let i = 0; i < 10; i += 1) {
    await page.keyboard.press("Tab");
    stops.push(
      await page.evaluate(() =>
        (
          document.activeElement?.textContent ||
          document.activeElement?.getAttribute("aria-label") ||
          ""
        )
          .trim()
          .slice(0, 30),
      ),
    );
  }
  for (const label of ["Work", "Services", "About", "Start"]) {
    if (!stops.some((s) => s === label))
      problems.push(
        `nav link "${label}" not reachable by keyboard (stops: ${stops.join("/")})`,
      );
  }
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE, { waitUntil: "load" });
  const btn = page.locator('button[aria-controls="site-menu"]');
  if ((await btn.getAttribute("aria-expanded")) !== "false")
    problems.push("menu button does not start collapsed");
  await btn.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  if ((await btn.getAttribute("aria-expanded")) !== "true")
    problems.push("menu button did not expand on Enter");
  if (
    !(await page
      .locator("#site-menu a", { hasText: "Services" })
      .first()
      .isVisible())
  )
    problems.push("mobile menu links not visible when expanded");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  if ((await btn.getAttribute("aria-expanded")) !== "false")
    problems.push("Escape did not close the mobile menu");
  await page.close();
}

// 3. Reduced motion: content is fully opaque and untransformed with no scrolling.
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  // Every content route, not just the homepage: the wrappers that strand an
  // opacity are on every page.
  for (const route of ["", "/work", "/about", "/services", "/start"]) {
    await page.goto(BASE + route, { waitUntil: "load" });
    await page.waitForTimeout(800);
    // [data-reveal] is the important one: those wrappers carry the server-set
    // opacity: 0, and checking only their children misses it entirely — a
    // child reads opacity 1 while the wrapper above it hides the whole block.
    const hidden = await page.evaluate(() => {
      const out = [];
      document
        .querySelectorAll("[data-reveal], h1, h2, h3, p, article, li")
        .forEach((el) => {
          const s = getComputedStyle(el);
          if (
            parseFloat(s.opacity) < 0.99 ||
            (s.transform !== "none" &&
              s.transform !== "matrix(1, 0, 0, 1, 0, 0)")
          ) {
            out.push(
              `${el.tagName}:${(el.textContent || "").trim().slice(0, 24)} opacity=${s.opacity} transform=${s.transform}`,
            );
          }
        });
      return out.slice(0, 5);
    });
    if (hidden.length)
      problems.push(
        `reduced motion left content animated/hidden on ${route || "/"}: ${hidden.join(" | ")}`,
      );
  }
  await page.close();
}

// 4. Form errors: server-side validation surfaces accessible, per-field messages.
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.goto(BASE + "/start", { waitUntil: "load" });
  await page.fill("#name", "Jordan Reyes");
  await page.fill("#email", "not-an-email");
  await page.click("button[type=submit]");
  await page.waitForTimeout(1200);
  const emailInvalid = await page
    .locator("#email")
    .getAttribute("aria-invalid");
  const describedBy = await page
    .locator("#email")
    .getAttribute("aria-describedby");
  if (emailInvalid !== "true")
    problems.push("invalid email field is not marked aria-invalid");
  if (!describedBy)
    problems.push("invalid email field has no aria-describedby error");
  else {
    const text = await page
      .locator(`#${describedBy.replace(/:/g, "\\:")}`)
      .textContent();
    if (!text || !text.trim()) problems.push("email error element is empty");
  }
  const orgInvalid = await page
    .locator("#organization")
    .getAttribute("aria-invalid");
  if (orgInvalid !== "true")
    problems.push("missing organization not marked aria-invalid");
  const msgInvalid = await page
    .locator("#message")
    .getAttribute("aria-invalid");
  if (msgInvalid !== "true")
    problems.push("missing project details not marked aria-invalid");
  if (await page.locator("text=Thank you").count())
    problems.push("FALSE SUCCESS: thank-you shown on an invalid submit");
  await page.close();
}

// 5. Never a false success when the destination is unconfigured.
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.goto(BASE + "/start", { waitUntil: "load" });
  await page.fill("#name", "Jordan Reyes");
  await page.fill("#organization", "Cedar Street Church");
  await page.fill("#email", "jordan@example.org");
  await page.fill(
    "#message",
    "Our site is five years old and nobody on staff can edit it.",
  );
  await page.click("button[type=submit]");
  await page.waitForTimeout(1500);
  if (await page.locator("text=Thank you").count())
    problems.push("FALSE SUCCESS: thank-you shown with no Airtable credential");
  const alert =
    (await page.locator("[role=alert]").first().textContent()) || "";
  if (!/wasn.t sent|not sent/i.test(alert))
    problems.push(
      `unconfigured state does not say the message was not sent: "${alert.trim().slice(0, 80)}"`,
    );
  await page.close();
}

// 6. Logo assets actually load, at their supplied intrinsic size.
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const failed = [];
  page.on("response", (r) => {
    if (r.url().includes("/brand/") && !r.ok())
      failed.push(`${r.url()} -> ${r.status()}`);
  });
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const imgs = await page.evaluate(() =>
    Array.from(document.images).map((i) => ({
      src: i.currentSrc,
      w: i.naturalWidth,
      h: i.naturalHeight,
      alt: i.alt,
    })),
  );
  for (const img of imgs) {
    if (!img.w || !img.h) problems.push(`logo did not decode: ${img.src}`);
  }
  if (!imgs.some((i) => i.alt === "Measure & Make"))
    problems.push("no lockup with the full-name alt text on the home page");
  if (failed.length)
    problems.push(`brand asset requests failed: ${failed.join(", ")}`);
  await page.close();
}

// 7. The first-load brand reveal: it must never be able to trap anyone, hide
// the page, or replay itself around the site. See src/components/BrandIntro.tsx.
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "commit" });
  await page.waitForTimeout(300);

  const live = await page.evaluate(() => {
    const el = document.querySelector(".mm-intro");
    if (!el) return null;
    return {
      ariaHidden: el.getAttribute("aria-hidden"),
      pointerEvents: getComputedStyle(el).pointerEvents,
      focusable: el.querySelectorAll(
        'a, button, input, select, textarea, [tabindex], [contenteditable="true"]',
      ).length,
    };
  });
  if (!live) {
    problems.push("brand reveal did not render on a first homepage visit");
  } else {
    if (live.ariaHidden !== "true")
      problems.push("brand reveal is not aria-hidden");
    if (live.pointerEvents !== "none")
      problems.push(
        `brand reveal takes pointer events (${live.pointerEvents})`,
      );
    if (live.focusable !== 0)
      problems.push(
        `brand reveal holds ${live.focusable} focusable element(s)`,
      );
  }

  // Keyboard access is never blocked while it plays.
  await page.keyboard.press("Tab");
  const focusTrapped = await page.evaluate(
    () =>
      !!document.querySelector(".mm-intro")?.contains(document.activeElement),
  );
  if (focusTrapped) problems.push("focus entered the brand reveal");

  // It comes down on its own, and scrolling comes back with it.
  await page.waitForTimeout(2300);
  const after = await page.evaluate(() => ({
    inDom: !!document.querySelector(".mm-intro"),
    overflow: document.documentElement.style.overflow,
    heroOpacity: getComputedStyle(document.querySelector("h1")).opacity,
  }));
  if (after.inDom) problems.push("brand reveal was still in the DOM at 2.6s");
  if (after.overflow && after.overflow !== "visible")
    problems.push(`scrolling was not restored (overflow: ${after.overflow})`);
  if (after.heroOpacity !== "1")
    problems.push(
      `hero headline was not settled (opacity ${after.heroOpacity})`,
    );

  // Second visit in the same session: no replay, not even a frame of it.
  await page.reload({ waitUntil: "commit" });
  await page.waitForTimeout(120);
  const replayed = await page.evaluate(() => {
    const el = document.querySelector(".mm-intro");
    return el ? getComputedStyle(el).display !== "none" : false;
  });
  if (replayed) problems.push("brand reveal replayed inside the same session");
  await ctx.close();
}

// 8. Reduced motion is never held in the sequence, and no other route plays it.
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "commit" });
  await page.waitForTimeout(400);
  const held = await page.evaluate(() => {
    const el = document.querySelector(".mm-intro");
    if (!el) return false;
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && s.opacity !== "0";
  });
  if (held)
    problems.push(
      "reduced motion was still covered by the brand reveal at 400ms",
    );

  for (const route of ["/work", "/about", "/services", "/start"]) {
    await page.goto(BASE + route, { waitUntil: "commit" });
    await page.waitForTimeout(100);
    const present = await page.evaluate(
      () => !!document.querySelector(".mm-intro"),
    );
    if (present) problems.push(`brand reveal rendered on ${route}`);
  }
  await ctx.close();
}

// 9. The hero lands fully opaque and untransformed, with no scrolling and no
// interaction — on the visit that plays the reveal, on a later visit that does
// not, and under reduced motion. This is the regression guard for a hero left
// part-way through an entrance animation.
{
  const readHero = `() => {
    const hero = document.querySelector("[data-mm-hero]");
    if (!hero) return { missing: true };
    const faded = [];
    // Every ancestor up to the document, since opacity multiplies down.
    for (let el = hero; el && el !== document.documentElement; el = el.parentElement) {
      const s = getComputedStyle(el);
      const t = s.transform;
      if (parseFloat(s.opacity) < 0.999 || (t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)"))
        faded.push(el.tagName + "." + String(el.className).slice(0, 20) + " opacity=" + s.opacity + " transform=" + t);
    }
    // And every element inside it: headline, copy, capability line, both CTAs.
    for (const el of hero.querySelectorAll("*")) {
      const s = getComputedStyle(el);
      const t = s.transform;
      if (parseFloat(s.opacity) < 0.999 || (t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)"))
        faded.push(el.tagName + ":" + (el.textContent || "").trim().slice(0, 18) + " opacity=" + s.opacity);
    }
    // A leftover inline opacity/transform means something scripted the hero
    // and did not finish; nothing should be writing inline style here at all.
    const inline = [hero, ...hero.parentElement ? [hero.parentElement] : []]
      .map((el) => el.getAttribute("style"))
      .filter((s) => s && /opacity|transform/.test(s));
    return { faded, inline, count: hero.querySelectorAll("*").length };
  }`;

  for (const [label, opts, settle, reload] of [
    ["first visit", { viewport: { width: 1440, height: 900 } }, 2600, false],
    ["later visit", { viewport: { width: 1440, height: 900 } }, 600, true],
    [
      "reduced motion",
      { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
      600,
      false,
    ],
    ["mobile", { viewport: { width: 390, height: 844 } }, 2200, false],
  ]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "commit" });
    if (reload) {
      await page.waitForTimeout(2400);
      await page.reload({ waitUntil: "commit" });
    }
    await page.waitForTimeout(settle);
    const hero = await page.evaluate(eval(readHero));
    if (hero.missing) {
      problems.push(`[${label}] hero block not found`);
    } else {
      if (!hero.count)
        problems.push(`[${label}] hero block is empty — nothing to check`);
      if (hero.faded.length)
        problems.push(
          `[${label}] hero did not settle: ${hero.faded.slice(0, 4).join(" | ")}`,
        );
      if (hero.inline.length)
        problems.push(
          `[${label}] hero carries scripted inline style: ${hero.inline.join(" | ")}`,
        );
    }
    await ctx.close();
  }
}

// 10. Every route's content settles fully opaque on load, with normal motion
// settings, no scrolling and no interaction — and the server HTML contains no
// inline opacity at all. This is the regression guard for content stranded
// behind an entrance animation, on every page rather than just the homepage.
{
  const readContent = `() => {
    const stuck = [];
    for (const el of document.querySelectorAll("[data-reveal], h1, h2, h3, p, article, li")) {
      const s = getComputedStyle(el);
      const t = s.transform;
      if (parseFloat(s.opacity) < 0.999 || (t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)"))
        stuck.push(el.tagName + (el.hasAttribute("data-reveal") ? "[data-reveal]" : "") + ":" + (el.textContent || "").trim().slice(0, 22) + " opacity=" + s.opacity);
    }
    // Nothing on the page should be carrying a scripted opacity/transform.
    const inline = [...document.querySelectorAll('[style*="opacity"], [style*="transform"]')]
      .map((el) => el.tagName + " " + el.getAttribute("style"));
    return { stuck, inline, reveals: document.querySelectorAll("[data-reveal]").length };
  }`;

  for (const [label, opts, settle] of [
    ["desktop", { viewport: { width: 1440, height: 900 } }, 2600],
    ["mobile", { viewport: { width: 390, height: 844 } }, 2400],
    [
      "reduced motion",
      { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
      900,
    ],
  ]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    for (const route of ROUTES.filter((r) => r !== "/nope")) {
      await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });

      // The served markup itself must not hide anything.
      const html = await page.content();
      if (/style="opacity:\s*0/.test(html))
        problems.push(
          `[${label}] ${route || "/"} server HTML contains inline opacity: 0`,
        );

      await page.waitForTimeout(settle);
      const r = await page.evaluate(eval(readContent));
      if (r.stuck.length)
        problems.push(
          `[${label}] ${route || "/"} content never settled (${r.stuck.length}): ${r.stuck.slice(0, 3).join(" | ")}`,
        );
      if (r.inline.length)
        problems.push(
          `[${label}] ${route || "/"} carries inline opacity/transform: ${r.inline.slice(0, 2).join(" | ")}`,
        );
    }
    await ctx.close();
  }
}

await browser.close();
console.log(
  problems.length
    ? "PROBLEMS:\n" + problems.map((p) => " - " + p).join("\n")
    : "ALL CHECKS PASSED",
);
