import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json-summary", "html"],
      exclude: [
        "src/components/ui/**",
        "src/client/**",
        "**/*.d.ts",
        "*.config.*",
        "vitest.setup.ts",
        ".next/**",
        "**/generated/**",
      ],
      thresholds: {
        lines: 91,
        functions: 95,
        branches: 83,
        statements: 91,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
