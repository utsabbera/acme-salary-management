import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getEmployeeEmployeesEmployeeIdGet } from "@/lib/generated";
import { EmployeeProfilePane } from "./employee-profile-pane";

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

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: vi.fn(),
}));

describe("EmployeeProfilePane", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("does not render when employeeId is not in search params", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReadonlyURLSearchParams,
    );

    const { container } = render(<EmployeeProfilePane />);

    // Should return null and render nothing
    expect(container.firstChild).toBeNull();
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

    render(<EmployeeProfilePane />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();

    // Check for toolbar buttons
    expect(screen.getByRole("button", { name: /open in full page/i })).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /close pane/i });
    expect(closeBtn).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(closeBtn);
    expect(mockPush).toHaveBeenCalledWith("?");
  });
});
