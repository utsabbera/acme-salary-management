import { describe, expect, it } from "vitest";
import { formatCurrency } from "./currency";

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    // 500000 minor units = $5,000.00
    expect(formatCurrency(500000, "USD")).toBe("$5,000.00");
  });

  it("formats EUR correctly", () => {
    // Note: Node's Intl uses different spacing/symbols for different locales
    // Since we hardcoded 'en-US' locale in formatCurrency, it will output €5,000.00
    expect(formatCurrency(500000, "EUR")).toBe("€5,000.00");
  });

  it("handles zero correctly", () => {
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });

  it("handles decimal precision correctly", () => {
    // 12345 minor units = 123.45
    expect(formatCurrency(12345, "USD")).toBe("$123.45");
  });
});
