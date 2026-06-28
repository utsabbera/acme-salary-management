import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addSalaryAdjustmentEmployeesEmployeeIdSalariesPost } from "@/lib/generated";
import { UpdateSalaryDialog } from "./update-salary-dialog";

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
    addSalaryAdjustmentEmployeesEmployeeIdSalariesPost: vi.fn(),
  };
});

describe("UpdateSalaryDialog", () => {
  const mockRouter = {
    refresh: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("submits the form successfully", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    vi.mocked(addSalaryAdjustmentEmployeesEmployeeIdSalariesPost).mockResolvedValue({
      data: {},
      error: undefined,
      response: {},
    } as unknown as Awaited<ReturnType<typeof addSalaryAdjustmentEmployeesEmployeeIdSalariesPost>>);

    render(
      <UpdateSalaryDialog
        employeeId={1}
        trigger={<button type="button">Adjust</button>}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Adjust" }));

    // Fill out the form
    await user.type(screen.getByLabelText("Valid From Date"), "2024-01-01");
    await user.clear(screen.getByLabelText("Currency"));
    await user.type(screen.getByLabelText("Currency"), "GBP");

    await user.clear(screen.getByLabelText("Base Salary"));
    await user.type(screen.getByLabelText("Base Salary"), "1000");

    await user.clear(screen.getByLabelText("Housing Allowance"));
    await user.type(screen.getByLabelText("Housing Allowance"), "200");

    await user.click(screen.getByRole("button", { name: "Save Adjustment" }));

    await waitFor(() => {
      expect(addSalaryAdjustmentEmployeesEmployeeIdSalariesPost).toHaveBeenCalledWith({
        client: expect.anything(),
        path: { employee_id: 1 },
        body: {
          valid_from: "2024-01-01",
          currency: "GBP",
          base_salary_minor_units: 100000,
          housing_allowance_minor_units: 20000,
          equity_minor_units: null,
          other_allowance_minor_units: null,
        },
      });
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("shows validation errors for invalid input", async () => {
    const user = userEvent.setup();
    render(<UpdateSalaryDialog employeeId={1} trigger={<button type="button">Adjust</button>} />);

    await user.click(screen.getByRole("button", { name: "Adjust" }));

    await user.clear(screen.getByLabelText("Currency"));

    await user.click(screen.getByRole("button", { name: "Save Adjustment" }));

    await waitFor(() => {
      expect(screen.getByText("Valid from date is required")).toBeInTheDocument();
      expect(screen.getByText("Currency code must be 3 characters")).toBeInTheDocument();
    });

    expect(addSalaryAdjustmentEmployeesEmployeeIdSalariesPost).not.toHaveBeenCalled();
  });

  it("shows an error toast when API returns an error", async () => {
    const user = userEvent.setup();
    vi.mocked(addSalaryAdjustmentEmployeesEmployeeIdSalariesPost).mockResolvedValue({
      error: "API Error",
    } as unknown as Awaited<ReturnType<typeof addSalaryAdjustmentEmployeesEmployeeIdSalariesPost>>);

    render(<UpdateSalaryDialog employeeId={1} trigger={<button type="button">Adjust</button>} />);
    await user.click(screen.getByRole("button", { name: "Adjust" }));

    await user.type(screen.getByLabelText("Valid From Date"), "2024-01-01");
    await user.click(screen.getByRole("button", { name: "Save Adjustment" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Could not update salary"));
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows an error toast when API throws an exception", async () => {
    const user = userEvent.setup();
    vi.mocked(addSalaryAdjustmentEmployeesEmployeeIdSalariesPost).mockRejectedValue(
      new Error("Network Error"),
    );

    render(<UpdateSalaryDialog employeeId={1} trigger={<button type="button">Adjust</button>} />);
    await user.click(screen.getByRole("button", { name: "Adjust" }));

    await user.type(screen.getByLabelText("Valid From Date"), "2024-01-01");
    await user.click(screen.getByRole("button", { name: "Save Adjustment" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Could not update salary"));
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes the dialog when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<UpdateSalaryDialog employeeId={1} trigger={<button type="button">Adjust</button>} />);
    await user.click(screen.getByRole("button", { name: "Adjust" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
