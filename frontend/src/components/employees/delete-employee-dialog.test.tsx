import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EmployeeRead } from "@/lib/generated";
import { deleteEmployeeEmployeesEmployeeIdDelete } from "@/lib/generated";
import { DeleteEmployeeDialog } from "./delete-employee-dialog";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock("@/lib/generated", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/generated")>();
  return {
    ...actual,
    deleteEmployeeEmployeesEmployeeIdDelete: vi.fn(),
  };
});

const mockEmployee: EmployeeRead = {
  id: 1,
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  department: "Engineering",
  country: "USA",
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
};

describe("DeleteEmployeeDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders a trigger element if provided", () => {
    render(
      <DeleteEmployeeDialog
        employee={mockEmployee}
        trigger={
          <button type="button" data-testid="test-trigger">
            Delete Me
          </button>
        }
      />,
    );

    expect(screen.getByTestId("test-trigger")).toBeInTheDocument();
  });

  it("redirects to redirectTo prop if provided on success", async () => {
    vi.mocked(deleteEmployeeEmployeesEmployeeIdDelete).mockResolvedValueOnce({
      data: undefined,
      error: undefined,
      response: new Response(),
    });

    render(
      <DeleteEmployeeDialog
        employee={mockEmployee}
        redirectTo="/home"
        trigger={
          <button type="button" data-testid="trigger">
            Delete
          </button>
        }
      />,
    );

    fireEvent.click(screen.getByTestId("trigger"));

    const confirmButton = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteEmployeeEmployeesEmployeeIdDelete).toHaveBeenCalledWith({
        client: expect.anything(),
        path: { employee_id: 1 },
      });
      expect(mockPush).toHaveBeenCalledWith("/home");
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  it("refreshes router if redirectTo is not provided on success", async () => {
    vi.mocked(deleteEmployeeEmployeesEmployeeIdDelete).mockResolvedValueOnce({
      data: undefined,
      error: undefined,
      response: new Response(),
    });

    render(
      <DeleteEmployeeDialog
        employee={mockEmployee}
        trigger={
          <button type="button" data-testid="trigger">
            Delete
          </button>
        }
      />,
    );

    fireEvent.click(screen.getByTestId("trigger"));

    const confirmButton = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
