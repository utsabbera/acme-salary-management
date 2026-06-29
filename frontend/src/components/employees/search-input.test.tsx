import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchInput } from "./search-input";

const mockReplace = vi.fn();
const mockUseSearchParams = vi.fn(() => new URLSearchParams());
const mockUsePathname = vi.fn(() => "/employees");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => mockUseSearchParams(),
  usePathname: () => mockUsePathname(),
}));

describe("SearchInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with initial value from search params", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?search=Jane"));
    render(<SearchInput />);
    expect(screen.getByRole("textbox")).toHaveValue("Jane");
  });

  it("updates URL search param after debounce when typing", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams(""));
    render(<SearchInput />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "John" } });

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith("/employees?search=John&offset=0");
      },
      { timeout: 1500 },
    );
  });

  it("resets offset to 0 when search changes", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?offset=40"));
    render(<SearchInput />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Doe" } });

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith("/employees?offset=0&search=Doe");
      },
      { timeout: 1500 },
    );
  });

  it("removes search param when input is cleared", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?search=Jane&offset=20"));
    render(<SearchInput />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "" } });

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith("/employees?offset=0");
      },
      { timeout: 1500 },
    );
  });

  it("does not trigger router.replace if the URL search params already match the input", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("search=Jane"));
    render(<SearchInput />);

    // Wait for the 500ms debounce
    await new Promise((r) => setTimeout(r, 600));

    // Currently, it always replaces the router even if the params are identical.
    // We expect it NOT to call replace if the query is equivalent, to prevent infinite polling loops.
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
