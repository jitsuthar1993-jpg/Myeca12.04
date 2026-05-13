import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || process.env.SMOKE_BASE_URL || "http://127.0.0.1:5000";
const shouldStartServer = !process.env.PLAYWRIGHT_BASE_URL && !process.env.SMOKE_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    serviceWorkers: "block",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: shouldStartServer
    ? {
        command: "npm.cmd start",
        url: baseURL,
        timeout: 30_000,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
