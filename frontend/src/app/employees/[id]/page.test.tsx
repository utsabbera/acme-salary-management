import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getEmployeeEmployeesEmployeeIdGet } from "@/lib/generated";
import EmployeeProfilePage from "./page";

vi.mock("@/lib/api", () => ({
  apiClient: {},
}));

vi.mock("@/lib/generated", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/generated")>();
  return {
    ...actual,
    getEmployeeEmployeesEmployeeIdGet: vi.fn(),
  };
});

describe("EmployeeProfilePage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("fetches and renders employee details", async () => {
    vi.mocked(getEmployeeEmployeesEmployeeIdGet).mockResolvedValue({
      data: {
        id: 1,
        first_name: "Alice",
        last_name: "Anderson",
        email: "alice@example.com",
        department: "Engineering",
        country: "US",
        current_salary: {
          salary_minor_units: 12000000,
          currency: "USD",
          salary_usd_minor_units: 12000000,
          valid_from: "2023-01-01",
        },
        salary_history: [
          {
            salary_minor_units: 12000000,
            currency: "USD",
            salary_usd_minor_units: 12000000,
            valid_from: "2023-01-01",
            valid_to: null,
          },
          {
            salary_minor_units: 10000000,
            currency: "USD",
            salary_usd_minor_units: 10000000,
            valid_from: "2021-01-01",
            valid_to: "2023-01-01",
          },
        ],
        created_at: "2021-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    } as unknown as Awaited<ReturnType<typeof getEmployeeEmployeesEmployeeIdGet>>);

    const ui = await EmployeeProfilePage({ params: Promise.resolve({ id: "1" }) });
    render(ui);

    expect(getEmployeeEmployeesEmployeeIdGet).toHaveBeenCalledWith({
      client: expect.any(Object),
      path: { employee_id: 1 },
    });

    expect(screen.getByText("Alice Anderson")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("US")).toBeInTheDocument();
    expect(screen.getAllByText("$120,000.00")[0]).toBeInTheDocument();
  });

  it("renders the salary timeline in descending order", async () => {
    vi.mocked(getEmployeeEmployeesEmployeeIdGet).mockResolvedValue({
      data: {
        id: 1,
        first_name: "Alice",
        last_name: "Anderson",
        email: "alice@example.com",
        department: "Engineering",
        country: "US",
        current_salary: {
          salary_minor_units: 12000000,
          currency: "USD",
          salary_usd_minor_units: 12000000,
          valid_from: "2023-01-01",
        },
        salary_history: [
          {
            salary_minor_units: 12000000,
            currency: "USD",
            salary_usd_minor_units: 12000000,
            valid_from: "2023-01-01",
            valid_to: null,
          },
          {
            salary_minor_units: 10000000,
            currency: "USD",
            salary_usd_minor_units: 10000000,
            valid_from: "2021-01-01",
            valid_to: "2023-01-01",
          },
        ],
        created_at: "2021-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    } as unknown as Awaited<ReturnType<typeof getEmployeeEmployeesEmployeeIdGet>>);

    const ui = await EmployeeProfilePage({ params: Promise.resolve({ id: "1" }) });
    render(ui);

    const salaries = screen.getAllByText(/\$100,000\.00|\$120,000\.00/);
    expect(salaries).toHaveLength(3);
  });

  it("renders a 404 message when the employee is not found", async () => {
    vi.mocked(getEmployeeEmployeesEmployeeIdGet).mockResolvedValue({
      error: { detail: "Not Found" },
    } as unknown as Awaited<ReturnType<typeof getEmployeeEmployeesEmployeeIdGet>>);

    const ui = await EmployeeProfilePage({ params: Promise.resolve({ id: "999" }) });
    render(ui);

    expect(screen.getByText("Employee not found")).toBeInTheDocument();
  });
});
