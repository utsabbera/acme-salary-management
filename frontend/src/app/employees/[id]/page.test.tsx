import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCountriesCountriesGet,
  getCurrenciesCurrenciesGet,
  getDepartmentsDepartmentsGet,
  getEmployeeEmployeesEmployeeIdGet,
} from "@/lib/generated";
import EmployeePage from "./page";

vi.mock("@/lib/generated", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/generated")>();
  return {
    ...actual,
    getEmployeeEmployeesEmployeeIdGet: vi.fn(),
    getDepartmentsDepartmentsGet: vi.fn(),
    getCountriesCountriesGet: vi.fn(),
    getCurrenciesCurrenciesGet: vi.fn(),
  };
});

vi.mock("@/lib/api", () => ({
  apiClient: {},
}));

// Mock Next.js navigation components like notFound
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: vi.fn(),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

describe("EmployeePage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders employee details and timeline", async () => {
    vi.mocked(getEmployeeEmployeesEmployeeIdGet).mockResolvedValue({
      data: {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        department: { id: 1, name: "Engineering" },
        country: { id: 1, name: "US", code: "US" },
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        current_salary: {
          salary_minor_units: 12000000, // $120,000.00
          currency: { code: "USD", name: "US Dollar" },
        },
        salary_history: [
          {
            valid_from: "2023-01-01",
            valid_to: null,
            base_salary_minor_units: 10000000,
            housing_allowance_minor_units: 2000000,
            equity_minor_units: null,
            other_allowance_minor_units: null,
            currency: { code: "USD", name: "US Dollar" },
          },
        ],
      },
    } as unknown as Awaited<ReturnType<typeof getEmployeeEmployeesEmployeeIdGet>>);

    vi.mocked(getDepartmentsDepartmentsGet).mockResolvedValue({
      data: [{ id: 1, name: "Engineering" }],
    } as unknown as Awaited<ReturnType<typeof getDepartmentsDepartmentsGet>>);

    vi.mocked(getCountriesCountriesGet).mockResolvedValue({
      data: [{ id: 1, code: "US", name: "United States" }],
    } as unknown as Awaited<ReturnType<typeof getCountriesCountriesGet>>);

    vi.mocked(getCurrenciesCurrenciesGet).mockResolvedValue({
      data: [{ id: 1, code: "USD", name: "US Dollar" }],
    } as unknown as Awaited<ReturnType<typeof getCurrenciesCurrenciesGet>>);

    const Page = await EmployeePage({ params: Promise.resolve({ id: "1" }) });
    render(Page);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getAllByText("$120,000.00").length).toBe(2);

    expect(getDepartmentsDepartmentsGet).toHaveBeenCalled();
    expect(getCountriesCountriesGet).toHaveBeenCalled();
    expect(getCurrenciesCurrenciesGet).toHaveBeenCalled();
  });

  it("calls notFound when the employee ID is invalid", async () => {
    const { notFound } = await import("next/navigation");
    await EmployeePage({ params: Promise.resolve({ id: "invalid" }) });
    expect(notFound).toHaveBeenCalled();
  });

  it("calls notFound when the API response has no data", async () => {
    const { notFound } = await import("next/navigation");
    vi.mocked(getEmployeeEmployeesEmployeeIdGet).mockResolvedValue({
      data: undefined,
    } as unknown as Awaited<ReturnType<typeof getEmployeeEmployeesEmployeeIdGet>>);

    vi.mocked(getDepartmentsDepartmentsGet).mockResolvedValue({ data: [] } as unknown as Awaited<
      ReturnType<typeof getDepartmentsDepartmentsGet>
    >);
    vi.mocked(getCountriesCountriesGet).mockResolvedValue({ data: [] } as unknown as Awaited<
      ReturnType<typeof getCountriesCountriesGet>
    >);
    vi.mocked(getCurrenciesCurrenciesGet).mockResolvedValue({ data: [] } as unknown as Awaited<
      ReturnType<typeof getCurrenciesCurrenciesGet>
    >);

    await EmployeePage({ params: Promise.resolve({ id: "1" }) });
    expect(notFound).toHaveBeenCalled();
  });

  it("calls notFound when the API throws an error", async () => {
    const { notFound } = await import("next/navigation");
    vi.mocked(getEmployeeEmployeesEmployeeIdGet).mockRejectedValue(new Error("API Error"));

    await EmployeePage({ params: Promise.resolve({ id: "1" }) });
    expect(notFound).toHaveBeenCalled();
  });
});
