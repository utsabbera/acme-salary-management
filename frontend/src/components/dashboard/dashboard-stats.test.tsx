import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardStatsDashboardStatsGet } from "@/lib/generated";
import { DashboardStats } from "./dashboard-stats";

vi.mock("@/lib/generated", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/generated")>();
  return {
    ...actual,
    getDashboardStatsDashboardStatsGet: vi.fn(),
  };
});

vi.mock("@/lib/api", () => ({
  apiClient: {},
}));

describe("DashboardStats", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders dashboard statistics including KPI cards and charts", async () => {
    vi.mocked(getDashboardStatsDashboardStatsGet).mockResolvedValue({
      data: {
        department_averages: [
          { department: "Engineering", average_salary_usd_minor_units: 12050000 },
          { department: "HR", average_salary_usd_minor_units: 8000000 },
        ],
        country_totals: [
          { country: "US", total_salary_usd_minor_units: 50000000 },
          { country: "UK", total_salary_usd_minor_units: 30000000 },
        ],
      },
    } as unknown as Awaited<ReturnType<typeof getDashboardStatsDashboardStatsGet>>);

    const Stats = await DashboardStats();
    render(Stats);

    await waitFor(() => {
      expect(screen.getByText(/\$120,500\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$500,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/Engineering/)).toBeInTheDocument();
      expect(screen.getByText(/US/)).toBeInTheDocument();

      expect(screen.getByTestId("department-chart")).toBeInTheDocument();
      expect(screen.getByTestId("country-chart")).toBeInTheDocument();
    });
  });

  it("renders an error message when API call fails", async () => {
    vi.mocked(getDashboardStatsDashboardStatsGet).mockResolvedValue({
      error: { message: "Internal Server Error" },
    } as unknown as Awaited<ReturnType<typeof getDashboardStatsDashboardStatsGet>>);

    const Stats = await DashboardStats();
    render(Stats);

    await waitFor(() => {
      expect(screen.getByText("Failed to load dashboard statistics.")).toBeInTheDocument();
    });
  });
});
