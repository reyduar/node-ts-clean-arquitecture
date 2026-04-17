import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@domain": resolve(__dirname, "src/domain"),
      "@application": resolve(__dirname, "src/aplication"),
      "@infrastructure": resolve(__dirname, "src/infrastructure"),
      "@shared": resolve(__dirname, "src/shared"),
      "@config": resolve(__dirname, "src/config"),
    },
  },
  test: {
    include: ["tests/**/*.spec.ts"],
    globals: true,
    environment: "node",
  },
});
