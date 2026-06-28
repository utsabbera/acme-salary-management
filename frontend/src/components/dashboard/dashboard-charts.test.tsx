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

    const chartComponentData = [{ name: "Base", value: 100000, fill: "var(--color-chart-1)" }];
    const chartDistributionData = [
      {
        department: "Engineering",
        range: [110000, 120500] as [number, number],
        median: 115250,
        fill: "var(--color-chart-1)",
      },
    ];
    const componentConfig = {
      value: { label: "Value" },
    };
    const distributionConfig = {
      median: { label: "Median Salary" },
      range: { label: "Salary Range (Middle 50%)" },
    };

    render(
      <DashboardCharts
        chartDeptData={chartDeptData}
        chartCountryData={chartCountryData}
        chartComponentData={chartComponentData}
        chartDistributionData={chartDistributionData}
        deptConfig={deptConfig}
        countryConfig={countryConfig}
        componentConfig={componentConfig}
        distributionConfig={distributionConfig}
      />,
    );

    expect(screen.getByTestId("department-chart")).toBeInTheDocument();
    expect(screen.getByTestId("country-chart")).toBeInTheDocument();
    expect(screen.getByTestId("component-chart")).toBeInTheDocument();
    expect(screen.getByTestId("distribution-chart")).toBeInTheDocument();

    expect(screen.getByText("Average Salary by Department")).toBeInTheDocument();
    expect(screen.getByText("Total Payroll by Country")).toBeInTheDocument();
    expect(screen.getByText("Spend by Component")).toBeInTheDocument();
    expect(screen.getByText("Pay Distribution across Roles")).toBeInTheDocument();
  });
});
