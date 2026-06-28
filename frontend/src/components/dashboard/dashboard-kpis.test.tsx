import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardKpis } from "./dashboard-kpis";

describe("DashboardKpis", () => {
  it("renders the KPI cards with correct currency formatting", () => {
    const departmentAverages = [
      { department: "Engineering", average_salary_usd_minor_units: 12050000 },
    ];
    const countryTotals = [{ country: "US", total_salary_usd_minor_units: 50000000 }];

    render(<DashboardKpis departmentAverages={departmentAverages} countryTotals={countryTotals} />);

    expect(screen.getByText("Engineering Avg Salary")).toBeInTheDocument();
    expect(screen.getByText(/\$120,500\.00/)).toBeInTheDocument();

    expect(screen.getByText("US Total Payroll")).toBeInTheDocument();
    expect(screen.getByText(/\$500,000\.00/)).toBeInTheDocument();
  });
});
