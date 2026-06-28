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

  it("renders granular salary components if they exist in current_salary", async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("?employeeId=2") as unknown as ReadonlyURLSearchParams,
    );

    vi.mocked(getEmployeeEmployeesEmployeeIdGet).mockResolvedValue({
      data: {
        id: 2,
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
        department: "Sales",
        country: "UK",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        current_salary: {
          salary_minor_units: 9500000,
          base_salary_minor_units: 6000000,
          housing_allowance_minor_units: 1000000,
          equity_minor_units: 2000000,
          other_allowance_minor_units: 500000,
          currency: "USD",
          valid_from: "2023-01-01",
        },
        salary_history: [],
      },
    } as unknown as Awaited<ReturnType<typeof getEmployeeEmployeesEmployeeIdGet>>);

    render(<EmployeeProfilePane />);

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    expect(screen.getByText("Base Salary")).toBeInTheDocument();
    // 6000000 minor units = $60,000.00
    expect(screen.getByText("$60,000.00")).toBeInTheDocument();

    expect(screen.getByText("Housing")).toBeInTheDocument();
    // 1000000 minor units = $10,000.00
    expect(screen.getByText("$10,000.00")).toBeInTheDocument();

    expect(screen.getByText("Equity")).toBeInTheDocument();
    // 2000000 minor units = $20,000.00
    expect(screen.getByText("$20,000.00")).toBeInTheDocument();

    expect(screen.getByText("Other")).toBeInTheDocument();
    // 500000 minor units = $5,000.00
    expect(screen.getByText("$5,000.00")).toBeInTheDocument();
  });

  it("safely omits optional components if they are null or 0", async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("?employeeId=3") as unknown as ReadonlyURLSearchParams,
    );

    vi.mocked(getEmployeeEmployeesEmployeeIdGet).mockResolvedValue({
      data: {
        id: 3,
        first_name: "Alice",
        last_name: "Bob",
        email: "alice@example.com",
        department: "Marketing",
        country: "CA",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        current_salary: {
          salary_minor_units: 5000000,
          base_salary_minor_units: 5000000,
          housing_allowance_minor_units: null,
          equity_minor_units: 0,
          other_allowance_minor_units: null,
          currency: "USD",
          valid_from: "2023-01-01",
        },
        salary_history: [],
      },
    } as unknown as Awaited<ReturnType<typeof getEmployeeEmployeesEmployeeIdGet>>);

    render(<EmployeeProfilePane />);

    await waitFor(() => {
      expect(screen.getByText("Alice Bob")).toBeInTheDocument();
    });

    expect(screen.getByText("Base Salary")).toBeInTheDocument();
    expect(screen.getAllByText("$50,000.00").length).toBeGreaterThan(0);

    expect(screen.queryByText("Housing")).not.toBeInTheDocument();
    expect(screen.queryByText("Equity")).not.toBeInTheDocument();
    expect(screen.queryByText("Other")).not.toBeInTheDocument();
  });

  it("renders component breakdown within the salary_history timeline items", async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("?employeeId=4") as unknown as ReadonlyURLSearchParams,
    );

    vi.mocked(getEmployeeEmployeesEmployeeIdGet).mockResolvedValue({
      data: {
        id: 4,
        first_name: "Timeline",
        last_name: "Tester",
        email: "timeline@example.com",
        department: "QA",
        country: "US",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        current_salary: null,
        salary_history: [
          {
            salary_minor_units: 7000000,
            base_salary_minor_units: 6000000,
            housing_allowance_minor_units: null,
            equity_minor_units: 1000000,
            other_allowance_minor_units: null,
            currency: "USD",
            valid_from: "2022-01-01",
            valid_to: "2023-01-01",
          },
        ],
      },
    } as unknown as Awaited<ReturnType<typeof getEmployeeEmployeesEmployeeIdGet>>);

    render(<EmployeeProfilePane />);

    await waitFor(() => {
      expect(screen.getByText("Timeline Tester")).toBeInTheDocument();
    });

    // It should render "Base Salary" and "Equity" within the history item
    expect(screen.getByText("Base Salary")).toBeInTheDocument();
    expect(screen.getByText("Equity")).toBeInTheDocument();
    expect(screen.getByText("$60,000.00")).toBeInTheDocument();
    expect(screen.getByText("$10,000.00")).toBeInTheDocument();
  });

  it("renders the Edit Employee button in the Details section", async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("?employeeId=1") as unknown as ReadonlyURLSearchParams,
    );

    vi.mocked(getEmployeeEmployeesEmployeeIdGet).mockResolvedValue({
      data: {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
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

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("renders the Delete Employee button in the Danger Zone section", async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("?employeeId=1") as unknown as ReadonlyURLSearchParams,
    );

    vi.mocked(getEmployeeEmployeesEmployeeIdGet).mockResolvedValue({
      data: {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
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

    expect(screen.getByRole("button", { name: "Delete Employee" })).toBeInTheDocument();
  });
});
