import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { apiClient } from "@/lib/api";
import { getDashboardStatsDashboardStatsGet } from "@/lib/generated";
import { formatCurrency } from "@/lib/utils/currency";
import { DashboardCharts } from "./dashboard-charts";

export async function DashboardStats() {
  const { data, error } = await getDashboardStatsDashboardStatsGet({
    client: apiClient,
  });

  if (error || !data) {
    return (
      <div className="rounded-md border p-8 text-center text-destructive">
        Failed to load dashboard statistics.
      </div>
    );
  }

  const chartDeptData = data.department_averages.map((d) => ({
    department: d.department,
    averageSalary: d.average_salary_usd_minor_units / 100,
  }));

  const chartCountryData = data.country_totals.map((c) => ({
    country: c.country,
    totalSalary: c.total_salary_usd_minor_units / 100,
    fill: `var(--color-${c.country.toLowerCase()})`,
  }));

  const deptConfig = {
    averageSalary: {
      label: "Avg Salary",
      color: "var(--color-chart-1)",
    },
  } satisfies ChartConfig;

  const countryConfig = chartCountryData.reduce(
    (acc, curr, index) => {
      acc[curr.country.toLowerCase()] = {
        label: curr.country,
        color: `var(--color-chart-${(index % 5) + 1})`,
      };
      return acc;
    },
    {
      totalSalary: { label: "Total Payroll" },
    } as ChartConfig,
  );

  const chartComponentData = [
    {
      name: "Base",
      value: data.component_totals.base_salary_usd_minor_units / 100,
      fill: "var(--color-chart-1)",
    },
    {
      name: "Housing",
      value: data.component_totals.housing_allowance_usd_minor_units / 100,
      fill: "var(--color-chart-2)",
    },
    {
      name: "Equity",
      value: data.component_totals.equity_usd_minor_units / 100,
      fill: "var(--color-chart-3)",
    },
    {
      name: "Other",
      value: data.component_totals.other_allowance_usd_minor_units / 100,
      fill: "var(--color-chart-4)",
    },
  ].filter((item) => item.value > 0);

  const componentConfig = {
    value: { label: "Value" },
    base: { label: "Base Salary", color: "var(--color-chart-1)" },
    housing: { label: "Housing", color: "var(--color-chart-2)" },
    equity: { label: "Equity", color: "var(--color-chart-3)" },
    other: { label: "Other", color: "var(--color-chart-4)" },
  } satisfies ChartConfig;

  const chartDistributionData = (data.salary_distribution || []).map((d) => {
    return {
      department: d.department,
      range: [d.p25_salary_usd_minor_units / 100, d.p75_salary_usd_minor_units / 100] as [
        number,
        number,
      ],
      median: d.p50_salary_usd_minor_units / 100,
      fill: "var(--color-chart-5)",
    };
  });

  const distributionConfig = {
    median: { label: "Median", color: "var(--color-chart-1)" },
    range: { label: "Core Band", color: "var(--color-chart-5)" },
  } satisfies ChartConfig;

  const totalEmployees = data.country_totals.reduce((acc, curr) => acc + (curr.headcount || 0), 0);
  const totalPayrollMinor = data.country_totals.reduce(
    (acc, curr) => acc + curr.total_salary_usd_minor_units,
    0,
  );
  const globalAvgCtcMinor = totalEmployees > 0 ? totalPayrollMinor / totalEmployees : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Avg CTC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(globalAvgCtcMinor, "USD")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annual Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayrollMinor, "USD")}</div>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts
        chartDeptData={chartDeptData}
        chartCountryData={chartCountryData}
        chartComponentData={chartComponentData}
        chartDistributionData={chartDistributionData}
        deptConfig={deptConfig}
        countryConfig={countryConfig}
        componentConfig={componentConfig}
        distributionConfig={distributionConfig}
      />
    </div>
  );
}
