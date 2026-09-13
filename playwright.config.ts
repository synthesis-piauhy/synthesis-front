import { defineConfig, devices } from "@playwright/test";

const localBrowserLibraryPath = process.env.PLAYWRIGHT_LOCAL_LIB_PATH;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    launchOptions: localBrowserLibraryPath
      ? { env: { LD_LIBRARY_PATH: localBrowserLibraryPath } }
      : undefined,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "NEXT_E2E=1 NEXT_PUBLIC_API_URL=mock NEXT_PUBLIC_MOCK_ROLE=gerente npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
