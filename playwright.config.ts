import { defineConfig, devices } from "@playwright/test";

const env = globalThis as { process?: { env?: Record<string, string | undefined> } };
const baseURL = env.process?.env?.E2E_BASE_URL ?? "http://127.0.0.1:4180";

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL,
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        }
      }
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        }
      }
    }
  ]
});
