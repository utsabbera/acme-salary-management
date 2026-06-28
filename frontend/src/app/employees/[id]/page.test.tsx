import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getEmployeeEmployeesEmployeeIdGet } from "@/lib/generated";
import EmployeePage from "./page";

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

// Mock Next.js navigation components like notFound
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: vi.fn(),
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
        department: "Engineering",
        country: "US",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        current_salary: {
          salary_minor_units: 12000000, // $120,000.00
          currency: "USD",
        },
        salary_history: [
          {
            valid_from: "2023-01-01",
            valid_to: null,
            salary_minor_units: 12000000,
            currency: "USD",
          },
        ],
      },
    } as unknown as Awaited<ReturnType<typeof getEmployeeEmployeesEmployeeIdGet>>);

    const Page = await EmployeePage({ params: Promise.resolve({ id: "1" }) });
    render(Page);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getAllByText("$120,000.00").length).toBeGreaterThan(0);
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
