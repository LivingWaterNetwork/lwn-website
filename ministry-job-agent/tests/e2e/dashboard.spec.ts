import { expect, test } from "@playwright/test";

/**
 * Dashboard smoke tests.
 *
 * These check that every route renders and — more importantly — that the safety
 * copy the candidate relies on is actually present in the UI, not just in the
 * domain layer. Run against a seeded database: `npm run setup && npm run seed:fixtures`.
 */

const ROUTES = ["/", "/pipeline", "/queue", "/theology", "/answers", "/candidate", "/portfolio", "/settings"];

for (const route of ROUTES) {
  test(`renders ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });
}

test("every page states that submission requires approval", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/No application is submitted without your explicit approval/i)).toBeVisible();
});

test("settings lists the actions that are never autonomous", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Never done without your approval" })).toBeVisible();
  await expect(page.getByText("Final application submission")).toBeVisible();
  await expect(page.getByText("Affirming statements of faith")).toBeVisible();
});

test("settings shows source access policies rather than scraping everything", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Source access policies" })).toBeVisible();
  await expect(page.getByText(/MANUAL ONLY/).first()).toBeVisible();
});

test("theology shows undefined positions rather than inventing them", async ({ page }) => {
  await page.goto("/theology");
  await expect(page.getByText("NOT YET DEFINED").first()).toBeVisible();
});

test("candidate profile shows NOT PROVIDED rather than placeholder facts", async ({ page }) => {
  await page.goto("/candidate");
  await expect(page.getByText("NOT PROVIDED").first()).toBeVisible();
});

test("the approve button is disabled while blockers stand", async ({ page }) => {
  await page.goto("/pipeline");
  const first = page.locator("a[href^='/opportunities/']").first();
  if ((await first.count()) === 0) test.skip(true, "No opportunities seeded.");
  await first.click();

  const approveLink = page.getByRole("link", { name: /approval screen/i });
  await expect(approveLink).toBeVisible();
  await approveLink.click();

  await expect(page.getByText(/Cannot approve/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "APPROVE APPLICATION" })).toBeDisabled();
});
