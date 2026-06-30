import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CountryRead, DepartmentRead } from "@/lib/generated";
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
          onValueChange("1");
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

const departments: DepartmentRead[] = [{ id: 1, name: "Engineering" }];
const countries: CountryRead[] = [
  {
    id: 1,
    code: "US",
    name: "United States",
    default_currency: { id: 1, code: "USD", name: "US Dollar" },
  },
];

describe("Filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("updates department and resets offset and employeeId", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?offset=20&employeeId=10"));
    render(<Filters departments={departments} countries={countries} />);

    const btn = screen.getAllByTestId("select-engineering")[0] as HTMLElement;
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/employees?department_id=1");
    });
  });

  it("removes filter and resets offset and employeeId when ALL is selected", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?department_id=1&employeeId=10"));
    render(<Filters departments={departments} countries={countries} />);

    const btn = screen.getAllByTestId("select-all")[0] as HTMLElement;
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/employees");
    });
  });

  it("removes country filter and resets offset and employeeId when ALL is selected", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?country_code=US&employeeId=10"));
    render(<Filters departments={departments} countries={countries} />);

    const btn = screen.getAllByTestId("select-all")[1] as HTMLElement;
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/employees");
    });
  });

  it("updates country and resets offset and employeeId", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?offset=20&employeeId=10"));
    render(<Filters departments={departments} countries={countries} />);

    const btn = screen.getAllByTestId("select-us")[1] as HTMLElement;
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/employees?country_code=US");
    });
  });

  it("renders default placeholder text when ALL is selected", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams(""));
    render(<Filters departments={departments} countries={countries} />);

    expect(screen.getAllByText("All Departments")[0]).toBeInTheDocument();
    expect(screen.getAllByText("All Countries")[0]).toBeInTheDocument();
  });

  it("renders selected value text", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?department_id=1&country_code=US"));
    render(<Filters departments={departments} countries={countries} />);

    expect(screen.getAllByText("Engineering")[0]).toBeInTheDocument();
    expect(screen.getAllByText("United States")[0]).toBeInTheDocument();
  });
});
