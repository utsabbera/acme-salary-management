import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrencyRead, CurrentSalary } from "@/lib/generated";
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

vi.mock("@/components/ui/select", () => ({
  Select: ({
    onValueChange,
    children,
    value,
  }: {
    onValueChange: (v: string) => void;
    children: ReactNode;
    value?: string;
  }) => (
    <div data-testid="mock-select" data-value={value}>
      {children}
      <button type="button" data-testid="select-gbp" onClick={() => onValueChange("GBP")}>
        Select GBP
      </button>
    </div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => (
    <div data-value={value}>{children}</div>
  ),
  SelectTrigger: ({
    children,
    "aria-label": ariaLabel,
  }: {
    children: ReactNode;
    "aria-label"?: string;
  }) => (
    <button type="button" aria-label={ariaLabel}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder, children }: { placeholder?: string; children?: ReactNode }) => (
    <span>{children ?? placeholder}</span>
  ),
}));

const currencies: CurrencyRead[] = [
  { id: 1, code: "USD", name: "US Dollar" },
  { id: 2, code: "GBP", name: "British Pound" },
];

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
        currencies={currencies}
        trigger={<button type="button">Adjust</button>}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Adjust" }));

    await user.type(screen.getByLabelText("Valid From Date"), "2024-01-01");

    // Select GBP via the mock button
    await user.click(screen.getByTestId("select-gbp"));

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
          currency_code: "GBP",
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

  it("submits the form successfully with all optional fields filled", async () => {
    const user = userEvent.setup();
    vi.mocked(addSalaryAdjustmentEmployeesEmployeeIdSalariesPost).mockResolvedValue({
      data: {},
      error: undefined,
      response: {},
    } as unknown as Awaited<ReturnType<typeof addSalaryAdjustmentEmployeesEmployeeIdSalariesPost>>);

    render(
      <UpdateSalaryDialog
        employeeId={1}
        currencies={currencies}
        trigger={<button type="button">Adjust</button>}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Adjust" }));
    await user.type(screen.getByLabelText("Valid From Date"), "2024-01-01");
    await user.click(screen.getByTestId("select-gbp"));
    await user.type(screen.getByLabelText("Base Salary"), "1000");
    await user.type(screen.getByLabelText("Housing Allowance"), "200");
    await user.type(screen.getByLabelText("Equity"), "5000.50");
    await user.type(screen.getByLabelText("Other Allowance"), "100.75");
    await user.click(screen.getByRole("button", { name: "Save Adjustment" }));

    await waitFor(() => {
      expect(addSalaryAdjustmentEmployeesEmployeeIdSalariesPost).toHaveBeenCalledWith({
        client: expect.anything(),
        path: { employee_id: 1 },
        body: {
          valid_from: "2024-01-01",
          currency_code: "GBP",
          base_salary_minor_units: 100000,
          housing_allowance_minor_units: 20000,
          equity_minor_units: 500050,
          other_allowance_minor_units: 10075,
        },
      });
    });
  });

  it("shows validation errors for invalid input", async () => {
    const user = userEvent.setup();
    render(
      <UpdateSalaryDialog
        employeeId={1}
        currencies={currencies}
        trigger={<button type="button">Adjust</button>}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Adjust" }));

    await user.click(screen.getByRole("button", { name: "Save Adjustment" }));

    await waitFor(() => {
      expect(screen.getByText("Valid from date is required")).toBeInTheDocument();
    });

    expect(addSalaryAdjustmentEmployeesEmployeeIdSalariesPost).not.toHaveBeenCalled();
  });

  it("shows an error toast when API returns an error", async () => {
    const user = userEvent.setup();
    vi.mocked(addSalaryAdjustmentEmployeesEmployeeIdSalariesPost).mockResolvedValue({
      error: "API Error",
    } as unknown as Awaited<ReturnType<typeof addSalaryAdjustmentEmployeesEmployeeIdSalariesPost>>);

    render(
      <UpdateSalaryDialog
        employeeId={1}
        currencies={currencies}
        trigger={<button type="button">Adjust</button>}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Adjust" }));

    await user.type(screen.getByLabelText("Valid From Date"), "2024-01-01");
    await user.click(screen.getByTestId("select-gbp"));
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

    render(
      <UpdateSalaryDialog
        employeeId={1}
        currencies={currencies}
        trigger={<button type="button">Adjust</button>}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Adjust" }));

    await user.type(screen.getByLabelText("Valid From Date"), "2024-01-01");
    await user.click(screen.getByTestId("select-gbp"));
    await user.click(screen.getByRole("button", { name: "Save Adjustment" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Could not update salary"));
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes the dialog when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(
      <UpdateSalaryDialog
        employeeId={1}
        currencies={currencies}
        trigger={<button type="button">Adjust</button>}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Adjust" }));

    expect(screen.getByLabelText(/base salary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/currency/i)).toHaveTextContent("USD");
    expect(screen.getByRole("button", { name: "Save Adjustment" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
  it("resets dirty form state when re-opened", async () => {
    const user = userEvent.setup();
    render(
      <UpdateSalaryDialog
        employeeId={1}
        currencies={currencies}
        trigger={<button type="button">Adjust</button>}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Adjust" }));

    const baseSalaryInput = screen.getByLabelText(/base salary/i);
    await user.clear(baseSalaryInput);
    await user.type(baseSalaryInput, "9999");

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Adjust" }));

    expect(screen.getByLabelText(/base salary/i)).toHaveValue(0);
  });

  it("resets form values when opened with a new currentSalary", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <UpdateSalaryDialog
        employeeId={1}
        currencies={currencies}
        trigger={<button type="button">Adjust</button>}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Adjust" }));
    expect(screen.getByLabelText(/base salary/i)).toHaveValue(0);
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    rerender(
      <UpdateSalaryDialog
        employeeId={1}
        currencies={currencies}
        currentSalary={
          {
            currency: currencies[1],
            base_salary_minor_units: 500000,
            housing_allowance_minor_units: null,
            equity_minor_units: null,
            other_allowance_minor_units: null,
            valid_from: "2024-01-01",
          } as unknown as CurrentSalary
        }
        trigger={<button type="button">Adjust</button>}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Adjust" }));

    expect(screen.getByLabelText(/base salary/i)).toHaveValue(5000);
    expect(screen.getByLabelText(/currency/i)).toHaveTextContent("GBP");
  });
});
