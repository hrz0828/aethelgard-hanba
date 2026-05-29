import { defineConfig } from "vitest/config";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [cloudflare()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"]
  }
});