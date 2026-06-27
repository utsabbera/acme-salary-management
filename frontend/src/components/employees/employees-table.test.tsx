import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteEmployeeEmployeesEmployeeIdDelete,
  updateEmployeeEmployeesEmployeeIdPatch,
} from "@/lib/generated";
import { EmployeesTable } from "./employees-table";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  apiClient: {},
}));

vi.mock("@/lib/generated", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/generated")>();
  return {
    ...actual,
    updateEmployeeEmployeesEmployeeIdPatch: vi.fn(),
    deleteEmployeeEmployeesEmployeeIdDelete: vi.fn(),
  };
});

const mockEmployees = [
  {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    department: "Engineering",
    country: "USA",
    salary: "100000",
    currency: "USD",
    salary_usd: "100000",
    valid_from: "2023-01-01",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    first_name: "Jane",
    last_name: "Smith",
    email: "jane@example.com",
    department: "HR",
    country: "UK",
    salary: "80000",
    currency: "GBP",
    salary_usd: "100000",
    valid_from: "2023-02-01",
    created_at: "2023-02-01T00:00:00Z",
    updated_at: "2023-02-01T00:00:00Z",
  },
];

describe("EmployeesTable", () => {
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders empty state when no employees", () => {
    render(<EmployeesTable employees={[]} />);
    expect(screen.getByText("No employees found.")).toBeInTheDocument();
  });

  it("renders a list of employees", () => {
    render(<EmployeesTable employees={mockEmployees} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("HR")).toBeInTheDocument();
  });

  it("formats salary with currency correctly", () => {
    render(<EmployeesTable employees={mockEmployees} />);
    expect(screen.getAllByText("$100,000.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("£80,000.00").length).toBeGreaterThan(0);
  });

  it("renders an action menu with Edit and Delete options for each employee", async () => {
    const user = userEvent.setup();
    render(<EmployeesTable employees={mockEmployees} />);

    const actionButtons = screen.getAllByRole("button", { name: /open menu/i });
    expect(actionButtons).toHaveLength(2);

    await user.click(actionButtons[0] as HTMLElement);

    expect(await screen.findByRole("menuitem", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /delete/i })).toBeInTheDocument();
  });

  it("opens an Edit dialog pre-filled with employee data when Edit is clicked", async () => {
    const user = userEvent.setup();
    render(<EmployeesTable employees={mockEmployees} />);

    const actionButtons = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(actionButtons[0] as HTMLElement);

    const editOption = await screen.findByRole("menuitem", { name: /edit/i });
    await user.click(editOption);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/edit employee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toHaveValue("John");
  });

  it("opens a Delete confirmation dialog when Delete is clicked", async () => {
    const user = userEvent.setup();
    render(<EmployeesTable employees={mockEmployees} />);

    const actionButtons = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(actionButtons[0] as HTMLElement);

    const deleteOption = await screen.findByRole("menuitem", { name: /delete/i });
    await user.click(deleteOption);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/are you absolutely sure/i)).toBeInTheDocument();
  });
  it("calls update API and refreshes router when Edit form is submitted", async () => {
    const user = userEvent.setup();
    vi.mocked(updateEmployeeEmployeesEmployeeIdPatch).mockResolvedValue({
      data: { id: 1 },
    } as unknown as Awaited<ReturnType<typeof updateEmployeeEmployeesEmployeeIdPatch>>);

    render(<EmployeesTable employees={mockEmployees} />);

    const actionButtons = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(actionButtons[0] as HTMLElement);

    const editOption = await screen.findByRole("menuitem", { name: /edit/i });
    await user.click(editOption);

    // Edit the first name
    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Johnny");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateEmployeeEmployeesEmployeeIdPatch).toHaveBeenCalledWith({
        client: expect.any(Object),
        path: { employee_id: 1 },
        body: {
          first_name: "Johnny",
          last_name: "Doe",
          email: "john@example.com",
          department: "Engineering",
          country: "USA",
        },
      });
    });

    expect(mockRefresh).toHaveBeenCalled();
  });

  it("calls delete API and refreshes router when Delete is confirmed", async () => {
    const user = userEvent.setup();
    vi.mocked(deleteEmployeeEmployeesEmployeeIdDelete).mockResolvedValue({
      data: { status: "ok" },
    } as unknown as Awaited<ReturnType<typeof deleteEmployeeEmployeesEmployeeIdDelete>>);

    render(<EmployeesTable employees={mockEmployees} />);

    const actionButtons = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(actionButtons[0] as HTMLElement);

    const deleteOption = await screen.findByRole("menuitem", { name: /delete/i });
    await user.click(deleteOption);

    const confirmButton = screen.getByRole("button", { name: /delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(deleteEmployeeEmployeesEmployeeIdDelete).toHaveBeenCalledWith({
        client: expect.any(Object),
        path: { employee_id: 1 },
      });
    });

    expect(mockRefresh).toHaveBeenCalled();
  });
});
