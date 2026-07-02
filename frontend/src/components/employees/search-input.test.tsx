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

const mockNProgressStart = vi.fn();
vi.mock("nprogress", () => ({
  default: {
    start: () => mockNProgressStart(),
  },
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
        expect(mockReplace).toHaveBeenCalledWith("/employees?search=John");
        expect(mockNProgressStart).toHaveBeenCalled();
      },
      { timeout: 1500 },
    );
  });

  it("resets offset to 0 and removes employeeId when search changes", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?offset=40&employeeId=10"));
    render(<SearchInput />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Doe" } });

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith("/employees?search=Doe");
        expect(mockNProgressStart).toHaveBeenCalled();
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
        expect(mockReplace).toHaveBeenCalledWith("/employees");
        expect(mockNProgressStart).toHaveBeenCalled();
      },
      { timeout: 1500 },
    );
  });

  it("does not trigger router.replace if the URL search params already match the input", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("search=Jane"));
    render(<SearchInput />);

    // Wait for the 500ms debounce
    await new Promise((r) => setTimeout(r, 600));

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("does not strip employeeId when searchParams change externally without search changing", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?search=Jane"));
    const { rerender } = render(<SearchInput />);

    await new Promise((r) => setTimeout(r, 600));
    expect(mockReplace).not.toHaveBeenCalled();

    mockUseSearchParams.mockReturnValue(new URLSearchParams("?search=Jane&employeeId=10"));
    rerender(<SearchInput />);

    await new Promise((r) => setTimeout(r, 600));
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
