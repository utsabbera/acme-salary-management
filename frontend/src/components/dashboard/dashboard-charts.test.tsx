import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardCharts } from "./dashboard-charts";

describe("DashboardCharts", () => {
  it("renders the charts without crashing", () => {
    const chartDeptData = [{ department: "Engineering", averageSalary: 120500 }];
    const chartCountryData = [{ country: "US", totalSalary: 500000, fill: "var(--color-us)" }];
    const deptConfig = {
      averageSalary: { label: "Avg Salary", color: "var(--color-chart-1)" },
    };
    const countryConfig = {
      totalSalary: { label: "Total Payroll" },
      us: { label: "US", color: "var(--color-chart-1)" },
    };

    render(
      <DashboardCharts
        chartDeptData={chartDeptData}
        chartCountryData={chartCountryData}
        deptConfig={deptConfig}
        countryConfig={countryConfig}
      />,
    );

    expect(screen.getByTestId("department-chart")).toBeInTheDocument();
    expect(screen.getByTestId("country-chart")).toBeInTheDocument();

    expect(screen.getByText("Average Salary by Department")).toBeInTheDocument();
    expect(screen.getByText("Total Payroll by Country")).toBeInTheDocument();
  });
});
