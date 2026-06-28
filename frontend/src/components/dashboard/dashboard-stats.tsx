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

  return (
    <div className="flex flex-col gap-8">
      <DashboardKpis
        departmentAverages={data.department_averages}
        countryTotals={data.country_totals}
      />
      <DashboardCharts
        chartDeptData={chartDeptData}
        chartCountryData={chartCountryData}
        deptConfig={deptConfig}
        countryConfig={countryConfig}
      />
    </div>
  );
}
