import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./utils";

describe("getErrorMessage", () => {
  it("returns fallback for null or undefined", () => {
    expect(getErrorMessage(null)).toBe("An unknown error occurred.");
    expect(getErrorMessage(undefined, "Custom fallback")).toBe("Custom fallback");
  });

  it("returns the error string if a string is provided", () => {
    expect(getErrorMessage("Direct string error")).toBe("Direct string error");
  });

  it("parses the new standardized Error Contract for validation errors", () => {
    const errorObj = {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input data",
        details: [
          { field: "email", issue: "value is not a valid email address" },
          { field: "department", issue: "field required" },
        ],
      },
    };

    expect(getErrorMessage(errorObj)).toBe(
      "Field 'email' is invalid: value is not a valid email address",
    );
  });

  it("parses the new standardized Error Contract for HTTP exceptions (no details)", () => {
    const errorObj = {
      error: {
        code: "NOT_FOUND",
        message: "Employee not found",
      },
    };

    expect(getErrorMessage(errorObj)).toBe("Employee not found");
  });

  it("falls back to error.message if the object doesn't match the API contract", () => {
    const errorObj = {
      message: "Generic JS Error",
    };

    expect(getErrorMessage(errorObj)).toBe("Generic JS Error");
  });

  it("returns fallback if it's an object with no recognizable fields", () => {
    const errorObj = {
      randomField: "random",
    };

    expect(getErrorMessage(errorObj)).toBe("An unknown error occurred.");
  });
});
