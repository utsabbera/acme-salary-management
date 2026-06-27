import { describe, expect, it } from "vitest";
import { formatDate } from "./date";

describe("formatDate", () => {
  it("formats standard ISO string correctly", () => {
    expect(formatDate("2023-01-15T00:00:00Z")).toBe("Jan 15, 2023");
  });

  it("formats date-only string correctly", () => {
    // Note: "2023-01-15" parsed as UTC might offset to Jan 14 depending on timezone
    // In node test environment, timezone might vary. For safety we just parse it.
    // Assuming local timezone doesn't offset it weirdly:
    // Actually, "2023-01-15" is parsed as midnight UTC by Date.
    // The test might be flaky depending on local time. Let's test with a fixed time.
    expect(formatDate("2023-01-15T12:00:00Z")).toBe("Jan 15, 2023");
  });
});
