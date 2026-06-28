import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EmployeeRead } from "@/lib/generated";
import { updateEmployeeEmployeesEmployeeIdPatch } from "@/lib/generated";
import { EditEmployeeDialog } from "./edit-employee-dialog";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("@/lib/generated", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/generated")>();
  return {
    ...actual,
    updateEmployeeEmployeesEmployeeIdPatch: vi.fn(),
  };
});

const mockEmployee: EmployeeRead = {
  id: 1,
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  department: { id: 1, name: "Engineering" },
  country: {
    id: 1,
    name: "USA",
    code: "US",
    default_currency: { id: 1, code: "USD", name: "US Dollar" },
  },
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
};

describe("EditEmployeeDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders a trigger element if provided", () => {
    render(
      <EditEmployeeDialog
        employee={mockEmployee}
        trigger={
          <button type="button" data-testid="test-trigger">
            Edit Me
          </button>
        }
      />,
    );

    expect(screen.getByTestId("test-trigger")).toBeInTheDocument();
  });

  it("refreshes router on successful update", async () => {
    vi.mocked(updateEmployeeEmployeesEmployeeIdPatch).mockResolvedValueOnce({
      data: mockEmployee,
      error: undefined,
      response: new Response(),
    });

    render(
      <EditEmployeeDialog
        employee={mockEmployee}
        trigger={
          <button type="button" data-testid="trigger">
            Edit
          </button>
        }
      />,
    );

    fireEvent.click(screen.getByTestId("trigger"));

    // Fill the form, we can just submit since the default values are valid
    const saveButton = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateEmployeeEmployeesEmployeeIdPatch).toHaveBeenCalledWith({
        client: expect.anything(),
        path: { employee_id: 1 },
        body: expect.objectContaining({
          first_name: "John",
          last_name: "Doe",
        }),
      });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows an error toast when API returns an error", async () => {
    vi.mocked(updateEmployeeEmployeesEmployeeIdPatch).mockResolvedValueOnce({
      error: "API Error",
    } as unknown as Awaited<ReturnType<typeof updateEmployeeEmployeesEmployeeIdPatch>>);

    render(
      <EditEmployeeDialog
        employee={mockEmployee}
        trigger={
          <button type="button" data-testid="trigger">
            Edit
          </button>
        }
      />,
    );

    fireEvent.click(screen.getByTestId("trigger"));
    const saveButton = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Could not update employee"),
      );
    });
  });

  it("shows an error toast when API throws an exception", async () => {
    vi.mocked(updateEmployeeEmployeesEmployeeIdPatch).mockRejectedValueOnce(
      new Error("Network Error"),
    );

    render(
      <EditEmployeeDialog
        employee={mockEmployee}
        trigger={
          <button type="button" data-testid="trigger">
            Edit
          </button>
        }
      />,
    );

    fireEvent.click(screen.getByTestId("trigger"));
    const saveButton = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Could not update employee"),
      );
    });
  });
});
