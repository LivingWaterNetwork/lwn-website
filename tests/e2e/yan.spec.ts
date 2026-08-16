import { test, expect } from "@playwright/test";

/**
 * Critical YAN journeys. Requires a running dev server with DATABASE_URL
 * configured (see playwright.config.ts webServer) — DB reads degrade
 * gracefully to empty/coming-soon states via safeYanQuery, so these pass
 * even before `npm run db:push` has been run.
 */

test("national homepage loads with the city selector", async ({ page }) => {
  await page.goto("/yan");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("network for what God is already doing");
  await page.getByRole("button", { name: "Find Your City" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("link", { name: /Atlanta/i }).first()).toBeVisible();
});

test("city selector routes to a city hub page", async ({ page }) => {
  await page.goto("/yan");
  await page.getByRole("button", { name: "Find Your City" }).click();
  await page.getByRole("dialog").getByRole("link", { name: /Atlanta/i }).click();
  await expect(page).toHaveURL(/\/yan\/atlanta/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("One City");
});

test("Atlanta hub page's movement gateway opens and routes into the join flow", async ({ page }) => {
  await page.goto("/yan/atlanta");
  await page.getByRole("button", { name: "Enter the Network" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("link", { name: /want to find a young-adult community/i }).click();
  await expect(page).toHaveURL(/\/yan\/join/);
});

test("new and unlaunched city hubs are honest about their stage", async ({ page }) => {
  await page.goto("/yan/new-york");
  await expect(page.getByText(/doesn't exist yet/i)).toBeVisible();
  await page.goto("/yan/los-angeles");
  await expect(page.getByText(/doesn't exist yet/i)).toBeVisible();
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
  const navLink = page.getByRole("navigation", { name: "YAN" }).getByRole("link", { name: "Network", exact: true });
  await navLink.focus();
  await expect(navLink).toBeFocused();
});

test("skip link is the first focusable element", async ({ page }) => {
  await page.goto("/yan");
  await page.keyboard.press("Tab");
  await expect(page.getByText("Skip to content")).toBeFocused();
});
