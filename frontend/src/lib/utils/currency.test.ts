import { describe, expect, it } from "vitest";
import type { ExchangeRateRead } from "../generated/types.gen";
import { convertMinorUnitsToUSD, formatCurrency } from "./currency";

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

describe("convertMinorUnitsToUSD", () => {
  const rates: ExchangeRateRead[] = [
    { id: 1, currency: "USD", rate: 1.0 },
    { id: 2, currency: "EUR", rate: 1.1 },
    { id: 3, currency: "GBP", rate: 1.25 },
  ];

  it("converts USD correctly", () => {
    expect(convertMinorUnitsToUSD(50000, "USD", rates)).toBe(500);
  });

  it("converts other currencies correctly", () => {
    // 10000 minor units EUR (100.00 EUR) * 1.1 = 110 USD
    expect(convertMinorUnitsToUSD(10000, "EUR", rates)).toBe(110);
  });

  it("returns null when rate is missing", () => {
    expect(convertMinorUnitsToUSD(10000, "CAD", rates)).toBeNull();
  });

  it("handles zero minor units correctly", () => {
    expect(convertMinorUnitsToUSD(0, "GBP", rates)).toBe(0);
  });

  it("handles rounding correctly", () => {
    // 12345 minor units GBP (123.45 GBP) * 1.25 = 154.3125 USD -> rounded to 154.31
    expect(convertMinorUnitsToUSD(12345, "GBP", rates)).toBe(154.31);
  });
});
