import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { type ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getEmployeeEmployeesEmployeeIdGet } from "@/lib/generated";
import { EmployeeProfileSheet } from "./employee-profile-sheet";

vi.mock("@/lib/generated", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/generated")>();
  return {
    ...actual,
    getEmployeeEmployeesEmployeeIdGet: vi.fn(),
  };
});

vi.mock("@/lib/api", () => ({
  apiClient: {},
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe("EmployeeProfileSheet", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("does not render when employeeId is not in search params", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReadonlyURLSearchParams,
    );

    render(<EmployeeProfileSheet />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens and fetches data when employeeId is present", async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("?employeeId=1") as unknown as ReadonlyURLSearchParams,
    );

    vi.mocked(getEmployeeEmployeesEmployeeIdGet).mockResolvedValue({
      data: {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        department: "Engineering",
        country: "US",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        current_salary: null,
        salary_history: [],
      },
    } as unknown as Awaited<ReturnType<typeof getEmployeeEmployeesEmployeeIdGet>>);

    render(<EmployeeProfileSheet />);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
  });
});
