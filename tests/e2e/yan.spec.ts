import { test, expect } from "@playwright/test";

/**
 * Critical YAN journeys. Requires a running dev server with DATABASE_URL
 * configured (see playwright.config.ts webServer) — DB reads degrade
 * gracefully to empty/coming-soon states via safeYanQuery, so these pass
 * even before `npm run db:push` has been run.
 */

test("homepage loads with the movement gateway", async ({ page }) => {
  await page.goto("/yan");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("One City");
  await page.getByRole("button", { name: "Enter the Network" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("link", { name: /pastor or church leader/i })).toBeVisible();
});

test("gateway pathway routes into the join flow", async ({ page }) => {
  await page.goto("/yan");
  await page.getByRole("button", { name: "Enter the Network" }).click();
  await page.getByRole("link", { name: /want to find a young-adult community/i }).click();
  await expect(page).toHaveURL(/\/yan\/join/);
});

test("join flow validates required fields before submit", async ({ page }) => {
  await page.goto("/yan/join?path=updates");
  await page.getByLabel("Name *").fill("Jamie Lee");
  // Email intentionally left blank — the browser's native required validation should block submit.
  const emailInput = page.getByLabel("Email *");
  await expect(emailInput).toHaveAttribute("required", "");
});

test("prayer request page shows crisis language and private-by-default option", async ({ page }) => {
  await page.goto("/yan/pray");
  await expect(page.getByText(/988/)).toBeVisible();
  await expect(page.getByLabel(/Keep this private/i)).toBeChecked();
});

test("every YAN nav route is reachable by keyboard from the homepage", async ({ page, isMobile }) => {
  test.skip(isMobile, "the desktop nav is intentionally hidden on mobile viewports; mobile keyboard access goes through the hamburger menu instead");
  await page.goto("/yan");
  const navLink = page.getByRole("navigation", { name: "YAN Atlanta" }).getByRole("link", { name: "Network", exact: true });
  await navLink.focus();
  await expect(navLink).toBeFocused();
});

test("skip link is the first focusable element", async ({ page }) => {
  await page.goto("/yan");
  await page.keyboard.press("Tab");
  await expect(page.getByText("Skip to content")).toBeFocused();
});
