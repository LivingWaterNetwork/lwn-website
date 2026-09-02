// Browser QA sweep. Run against a built site:
//
//   npm run build && npx next start -p 4330 &
//   node scripts/qa.mjs
//
// Checks every route at desktop, tablet, and mobile widths for console and
// hydration errors and horizontal overflow, then checks keyboard order and
// focus visibility, the mobile menu's disclosure behavior, reduced motion,
// accessible per-field form errors, that success is never shown without a
// confirmed write, and that the brand lockups actually decode.
import { chromium } from "playwright";
const BASE = "http://localhost:4330/measure-and-make";
// /nope is the deliberate 404 check; its own 404 response is not a defect.
const ROUTES = [
  "",
  "/about",
  "/work",
  "/work/living-water-network-digital-platform",
  "/work/young-adults-network-platform",
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
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const hidden = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("h2, h3, article, li").forEach((el) => {
      const s = getComputedStyle(el);
      if (
        parseFloat(s.opacity) < 0.99 ||
        (s.transform !== "none" && s.transform !== "matrix(1, 0, 0, 1, 0, 0)")
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
      `reduced motion left content animated/hidden: ${hidden.join(" | ")}`,
    );
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

await browser.close();
console.log(
  problems.length
    ? "PROBLEMS:\n" + problems.map((p) => " - " + p).join("\n")
    : "ALL CHECKS PASSED",
);
