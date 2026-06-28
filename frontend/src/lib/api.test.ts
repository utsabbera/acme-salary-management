import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("api client", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    vi.resetModules();
    originalEnv = process.env.NEXT_PUBLIC_API_URL;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  it("warns if NEXT_PUBLIC_API_URL is missing", async () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    delete process.env.NEXT_PUBLIC_API_URL;

    await import("./api");

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "NEXT_PUBLIC_API_URL environment variable is not defined",
    );
    consoleWarnSpy.mockRestore();
  });

  it("exports apiClient if NEXT_PUBLIC_API_URL is defined", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";

    const { apiClient } = await import("./api");
    expect(apiClient).toBeDefined();
  });
});
