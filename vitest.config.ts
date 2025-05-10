import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      headless: true,
      enabled: true,
      provider: "playwright",
      name: "chromium",
      screenshotFailures: false,
    },
  },
});
