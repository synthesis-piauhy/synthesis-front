import { defineConfig, devices } from "@playwright/test";

const localBrowserLibraryPath = process.env.PLAYWRIGHT_LOCAL_LIB_PATH;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "integration.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3101",
    launchOptions: localBrowserLibraryPath
      ? { env: { LD_LIBRARY_PATH: localBrowserLibraryPath } }
      : undefined,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium-integration", use: { ...devices["Desktop Chrome"] } }],
});
