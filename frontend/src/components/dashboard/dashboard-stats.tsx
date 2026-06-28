import type { ChartConfig } from "@/components/ui/chart";
import { apiClient } from "@/lib/api";
import { getDashboardStatsDashboardStatsGet } from "@/lib/generated";
import { DashboardCharts } from "./dashboard-charts";
import { DashboardKpis } from "./dashboard-kpis";

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

  return (
    <div className="flex flex-col gap-8">
      <DashboardKpis
        departmentAverages={data.department_averages}
        countryTotals={data.country_totals}
      />
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
