import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CountryRead, DepartmentRead } from "@/lib/generated";
import { updateEmployeeEmployeesEmployeeIdPatch } from "@/lib/generated";
import { EditEmployeeDialog } from "./edit-employee-dialog";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("@/lib/api", () => ({
  apiClient: {},
}));

vi.mock("@/lib/generated", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/generated")>();
  return {
    ...actual,
    updateEmployeeEmployeesEmployeeIdPatch: vi.fn(),
  };
});

const departments: DepartmentRead[] = [{ id: 1, name: "Engineering" }];
const countries: CountryRead[] = [
  {
    id: 1,
    code: "US",
    name: "United States",
    default_currency: { id: 1, code: "USD", name: "US Dollar" },
  },
];

describe("EditEmployeeDialog", () => {
  const mockRouter = {
    refresh: vi.fn(),
  };

  const mockEmployee = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    department: { id: 1, name: "Engineering" },
    country: {
      id: 1,
      code: "US",
      name: "United States",
      default_currency: { id: 1, code: "USD", name: "US Dollar" },
    },
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    salary_history: [],
  };

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("opens the dialog when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <EditEmployeeDialog
        employee={mockEmployee}
        departments={departments}
        countries={countries}
        trigger={<button type="button">Edit</button>}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Edit Employee")).toBeInTheDocument();
  });

  it("refreshes router on successful update", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(updateEmployeeEmployeesEmployeeIdPatch).mockResolvedValue({
      data: { ...mockEmployee, first_name: "Jane" },
      error: undefined,
      response: {},
    } as unknown as Awaited<ReturnType<typeof updateEmployeeEmployeesEmployeeIdPatch>>);

    render(
      <EditEmployeeDialog
        employee={mockEmployee}
        departments={departments}
        countries={countries}
        trigger={<button type="button">Edit</button>}
        onSuccess={onSuccess}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await user.clear(screen.getByLabelText(/first name/i));
    await user.type(screen.getByLabelText(/first name/i), "Jane");

    // Click submit
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateEmployeeEmployeesEmployeeIdPatch).toHaveBeenCalled();
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("shows an error toast if API returns an error", async () => {
    const user = userEvent.setup();
    vi.mocked(updateEmployeeEmployeesEmployeeIdPatch).mockResolvedValue({
      data: undefined,
      error: { detail: [{ loc: ["body"], msg: "Validation failed", type: "value_error" }] },
      response: {} as Response,
    });

    render(
      <EditEmployeeDialog
        employee={mockEmployee}
        departments={departments}
        countries={countries}
        trigger={<button type="button">Edit</button>}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Validation failed"));
    });
  });

  it("shows an error toast if API throws an exception", async () => {
    const user = userEvent.setup();
    vi.mocked(updateEmployeeEmployeesEmployeeIdPatch).mockRejectedValue(new Error("Network Error"));

    render(
      <EditEmployeeDialog
        employee={mockEmployee}
        departments={departments}
        countries={countries}
        trigger={<button type="button">Edit</button>}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Network Error"));
    });
  });
});
