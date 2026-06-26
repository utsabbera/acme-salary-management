import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Filters } from "./filters";

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

vi.mock("@/components/ui/select", () => ({
  Select: ({
    onValueChange,
    children,
    value,
  }: {
    onValueChange: (v: string) => void;
    children: ReactNode;
    value: string;
  }) => (
    <div data-testid="mock-select" data-value={value}>
      {children}
      <button
        type="button"
        data-testid="select-engineering"
        onClick={() => {
          onValueChange("Engineering");
        }}
      >
        Select Engineering
      </button>
      <button
        type="button"
        data-testid="select-all"
        onClick={() => {
          onValueChange("ALL");
        }}
      >
        Select All
      </button>
      <button
        type="button"
        data-testid="select-us"
        onClick={() => {
          onValueChange("US");
        }}
      >
        Select US
      </button>
    </div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe("Filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("updates department and resets offset", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?offset=20"));
    render(<Filters />);

    // Trigger select for department
    const btn = screen.getAllByTestId("select-engineering")[0] as HTMLElement;
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/employees?offset=0&department=Engineering");
    });
  });

  it("removes filter when ALL is selected", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?department=Engineering"));
    render(<Filters />);

    const btn = screen.getAllByTestId("select-all")[0] as HTMLElement;
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/employees?offset=0");
    });
  });

  it("updates country and resets offset", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?offset=20"));
    render(<Filters />);

    const btn = screen.getAllByTestId("select-us")[1] as HTMLElement;
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/employees?offset=0&country=US");
    });
  });
});
