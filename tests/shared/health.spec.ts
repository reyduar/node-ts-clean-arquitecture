import { describe, it, expect } from "vitest";
import { isHealthy } from "@shared/health";

describe("isHealthy", () => {
  it("should return true", () => {
    expect(isHealthy()).toBe(true);
  });
});
