import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardStatsDashboardStatsGet } from "@/lib/generated";
import { buildComponentChartData, buildCountryChartData, DashboardStats } from "./dashboard-stats";

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

  it("renders dashboard statistics including summary strip and charts", async () => {
    vi.mocked(getDashboardStatsDashboardStatsGet).mockResolvedValue({
      data: {
        department_averages: [
          { department: "Engineering", average_salary_usd_minor_units: 12050000 },
          { department: "HR", average_salary_usd_minor_units: 8000000 },
        ],
        country_totals: [
          { country: "US", total_salary_usd_minor_units: 50000000, headcount: 5 },
          { country: "UK", total_salary_usd_minor_units: 30000000, headcount: 3 },
        ],
        component_totals: {
          base_salary_usd_minor_units: 70000000,
          housing_allowance_usd_minor_units: 5000000,
          equity_usd_minor_units: 4000000,
          other_allowance_usd_minor_units: 1000000,
        },
        salary_distribution: [
          { department: "Engineering", salary_usd_minor_units: 12050000 },
          { department: "Engineering", salary_usd_minor_units: 11000000 },
          { department: "HR", salary_usd_minor_units: 8000000 },
        ],
      },
    } as unknown as Awaited<ReturnType<typeof getDashboardStatsDashboardStatsGet>>);

    const Stats = await DashboardStats();
    render(Stats);

    await waitFor(() => {
      expect(screen.getByText("Total Employees")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
      expect(screen.getByText("Total Annual Payroll")).toBeInTheDocument();
      expect(screen.getByText(/\$800,000\.00/)).toBeInTheDocument();
      expect(screen.getByText("Global Avg CTC")).toBeInTheDocument();
      expect(screen.getByText(/\$100,000\.00/)).toBeInTheDocument();

      expect(screen.getByTestId("department-chart")).toBeInTheDocument();
      expect(screen.getByTestId("country-chart")).toBeInTheDocument();
      expect(screen.getByTestId("component-chart")).toBeInTheDocument();
      expect(screen.getByTestId("distribution-chart")).toBeInTheDocument();
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

  it("renders with missing optional data gracefully", async () => {
    vi.mocked(getDashboardStatsDashboardStatsGet).mockResolvedValue({
      data: {
        department_averages: [],
        country_totals: [{ country: "US", total_salary_usd_minor_units: 50000000 }],
        component_totals: {
          base_salary_usd_minor_units: 70000000,
          housing_allowance_usd_minor_units: 5000000,
          equity_usd_minor_units: 4000000,
          other_allowance_usd_minor_units: 1000000,
        },
      },
    } as unknown as Awaited<ReturnType<typeof getDashboardStatsDashboardStatsGet>>);

    const Stats = await DashboardStats();
    render(Stats);

    await waitFor(() => {
      expect(screen.getByText("Total Employees")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("Total Annual Payroll")).toBeInTheDocument();
      expect(screen.getByText(/\$500,000\.00/)).toBeInTheDocument();
      expect(screen.getByText("Global Avg CTC")).toBeInTheDocument();
      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
    });
  });

  describe("Chart Data Builders", () => {
    const mockData = {
      department_averages: [],
      country_totals: [{ country: "US", total_salary_usd_minor_units: 50000000, headcount: 5 }],
      component_totals: {
        base_salary_usd_minor_units: 70000000,
        housing_allowance_usd_minor_units: 5000000,
        equity_usd_minor_units: 0,
        other_allowance_usd_minor_units: 0,
      },
      salary_distribution: [],
    } as unknown as Awaited<ReturnType<typeof getDashboardStatsDashboardStatsGet>>["data"];

    it("ensures country chart data keys strictly match country chart config keys", () => {
      const { chartCountryData, countryConfig } = buildCountryChartData(
        mockData as NonNullable<typeof mockData>,
      );

      const dataItem = chartCountryData[0];
      expect(dataItem).toBeDefined();
      if (!dataItem) return;

      expect(dataItem.country).toBe("US");
      const safeKey = dataItem.safeKey;
      expect(countryConfig[safeKey]).toBeDefined();
      expect(countryConfig[safeKey]?.label).toBe("US");
    });

    it("ensures component chart data keys strictly match component chart config keys", () => {
      const { chartComponentData, componentConfig } = buildComponentChartData(
        mockData as NonNullable<typeof mockData>,
      );

      const componentNames = chartComponentData.map((d: { name: string }) => d.name);
      expect(componentNames).toContain("base");
      expect(componentNames).toContain("housing");

      const configMap = componentConfig as Record<string, unknown>;
      componentNames.forEach((name: string) => {
        expect(configMap[name]).toBeDefined();
      });
    });
  });
});
