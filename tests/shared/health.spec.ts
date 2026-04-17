import { describe, it, expect } from "vitest";
import { isHealthy } from "../../src/shared/health.js";

describe("isHealthy", () => {
  it("should return true", () => {
    expect(isHealthy()).toBe(true);
  });
});
