import { defineConfig } from "vitest/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.metal.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@domain": resolve(__dirname, "./src/domain"),
      "@application": resolve(__dirname, "./src/aplication"),
      "@infrastructure": resolve(__dirname, "src/infrastructure"),
      "@shared": resolve(__dirname, "./src/shared"),
      "@config": resolve(__dirname, "./src/config"),
    },
  },
  test: {
    include: ["tests/**/*.spec.ts", "src/**/*.spec.ts"],
    globals: true,
    environment: "node",
  },
});
