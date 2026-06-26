import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Pagination } from "./pagination";

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

describe("Pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("disables previous button on first page", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?offset=0&limit=20"));
    render(<Pagination total={100} />);

    const prevButton = screen.getByRole("button", { name: "Previous page" });
    expect(prevButton).toBeDisabled();
  });

  it("disables next button on last page", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?offset=80&limit=20"));
    render(<Pagination total={90} />);

    const nextButton = screen.getByRole("button", { name: "Next page" });
    expect(nextButton).toBeDisabled();
  });

  it("navigates to next page", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?offset=20&limit=20"));
    render(<Pagination total={100} />);

    const nextButton = screen.getByRole("button", { name: "Next page" });
    fireEvent.click(nextButton);

    expect(mockReplace).toHaveBeenCalledWith("/employees?offset=40&limit=20");
  });

  it("navigates to previous page", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?offset=40&limit=20"));
    render(<Pagination total={100} />);

    const prevButton = screen.getByRole("button", { name: "Previous page" });
    fireEvent.click(prevButton);

    expect(mockReplace).toHaveBeenCalledWith("/employees?offset=20&limit=20");
  });
});
