import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config for the dashboard. Application-assist automation does NOT run
 * through this config — it runs through browser/run-assist.ts, headed, under
 * the safety rules in browser/safety.ts.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100",
    trace: "on-first-retry",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : undefined,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
