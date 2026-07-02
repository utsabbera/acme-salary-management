import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmployeeProfilePane } from "./employee-profile-pane";

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockTopLoaderDone = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useSearchParams: vi.fn(() => new URLSearchParams("?employeeId=1")),
}));

vi.mock("nextjs-toploader", () => ({
  useTopLoader: () => ({
    done: mockTopLoaderDone,
    start: vi.fn(),
  }),
}));

const mockEmployee = {
  id: 1,
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  department: { id: 1, name: "Engineering" },
  country: {
    id: 1,
    name: "US",
    code: "US",
    default_currency: { id: 1, code: "USD", name: "US Dollar", symbol: "$" },
  },
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  current_salary: null,
  salary_history: [],
} as unknown as import("@/lib/generated").EmployeeRead;

describe("EmployeeProfilePane", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders employee details correctly", () => {
    render(
      <EmployeeProfilePane
        employee={mockEmployee}
        departments={[]}
        countries={[]}
        currencies={[]}
      />,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /close pane/i })).toBeInTheDocument();
  });

  it("calls topLoader.done() when rendered", () => {
    render(
      <EmployeeProfilePane
        employee={mockEmployee}
        departments={[]}
        countries={[]}
        currencies={[]}
      />,
    );

    expect(mockTopLoaderDone).toHaveBeenCalled();
  });

  it("renders granular salary components if they exist in current_salary", () => {
    const salariedEmployee = {
      ...mockEmployee,
      current_salary: {
        salary_minor_units: 9500000,
        base_salary_minor_units: 6000000,
        housing_allowance_minor_units: 1000000,
        equity_minor_units: 2000000,
        other_allowance_minor_units: 500000,
        currency: { code: "USD", name: "US Dollar" },
        valid_from: "2023-01-01",
      },
    } as unknown as import("@/lib/generated").EmployeeRead;

    render(
      <EmployeeProfilePane
        employee={salariedEmployee}
        departments={[]}
        countries={[]}
        currencies={[]}
      />,
    );

    expect(screen.getByText("Base Salary")).toBeInTheDocument();
    expect(screen.getByText("$60,000.00")).toBeInTheDocument();

    expect(screen.getByText("Housing")).toBeInTheDocument();
    expect(screen.getByText("$10,000.00")).toBeInTheDocument();

    expect(screen.getByText("Equity")).toBeInTheDocument();
    expect(screen.getByText("$20,000.00")).toBeInTheDocument();

    expect(screen.getByText("Other")).toBeInTheDocument();
    expect(screen.getByText("$5,000.00")).toBeInTheDocument();
  });

  it("safely omits optional components if they are null or 0", () => {
    const partialSalaryEmployee = {
      ...mockEmployee,
      current_salary: {
        salary_minor_units: 5000000,
        base_salary_minor_units: 5000000,
        housing_allowance_minor_units: null,
        equity_minor_units: 0,
        other_allowance_minor_units: null,
        currency: { code: "USD", name: "US Dollar" },
        valid_from: "2023-01-01",
      },
    } as unknown as import("@/lib/generated").EmployeeRead;

    render(
      <EmployeeProfilePane
        employee={partialSalaryEmployee}
        departments={[]}
        countries={[]}
        currencies={[]}
      />,
    );

    expect(screen.getByText("Base Salary")).toBeInTheDocument();
    expect(screen.getAllByText("$50,000.00").length).toBeGreaterThan(0);

    expect(screen.queryByText("Housing")).not.toBeInTheDocument();
    expect(screen.queryByText("Equity")).not.toBeInTheDocument();
    expect(screen.queryByText("Other")).not.toBeInTheDocument();
  });

  it("renders the Edit Employee button in the Details section", () => {
    render(
      <EmployeeProfilePane
        employee={mockEmployee}
        departments={[]}
        countries={[]}
        currencies={[]}
      />,
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("renders the Employee Details card title", () => {
    render(
      <EmployeeProfilePane
        employee={mockEmployee}
        departments={[]}
        countries={[]}
        currencies={[]}
      />,
    );

    expect(screen.getByText("Employee Details")).toBeInTheDocument();
  });

  it("renders the Delete Employee button in the Danger Zone section", () => {
    render(
      <EmployeeProfilePane
        employee={mockEmployee}
        departments={[]}
        countries={[]}
        currencies={[]}
      />,
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("renders 'Employee not found' when employee is undefined", () => {
    render(
      <EmployeeProfilePane
        employee={undefined as unknown as import("@/lib/generated").EmployeeRead}
        departments={[]}
        countries={[]}
        currencies={[]}
      />,
    );
    expect(screen.getByText("Employee not found")).toBeInTheDocument();
  });

  it("renders salary history if present", () => {
    const employeeWithHistory = {
      ...mockEmployee,
      salary_history: [
        {
          salary_minor_units: 9000000,
          currency: { code: "USD", name: "US Dollar" },
          valid_from: "2022-01-01",
          valid_to: "2023-01-01",
        },
        {
          salary_minor_units: 8000000,
          currency: { code: "USD", name: "US Dollar" },
          valid_from: "2021-01-01",
          valid_to: "2022-01-01",
        },
      ],
    } as unknown as import("@/lib/generated").EmployeeRead;

    render(
      <EmployeeProfilePane
        employee={employeeWithHistory}
        departments={[]}
        countries={[]}
        currencies={[]}
      />,
    );

    expect(screen.getByText("Compensation History")).toBeInTheDocument();

    expect(screen.getByText("$90,000.00")).toBeInTheDocument();
    expect(screen.getByText("$80,000.00")).toBeInTheDocument();
  });
});
