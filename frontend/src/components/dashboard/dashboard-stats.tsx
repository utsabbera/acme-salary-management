import { CircleDollarSign, Globe, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { apiClient } from "@/lib/api";
import {
  type DashboardStats as DashboardStatsSchema,
  getDashboardStatsDashboardStatsGet,
} from "@/lib/generated";
import { formatCurrency } from "@/lib/utils/currency";
import { DashboardCharts } from "./dashboard-charts";

export function buildCountryChartData(data: DashboardStatsSchema) {
  const chartCountryData = data.country_totals.map((c) => ({
    country: c.country,
    totalSalary: c.total_salary_usd_minor_units / 100,
    fill: `var(--color-${c.country})`,
  }));

  const countryConfig = chartCountryData.reduce(
    (acc, curr, index) => {
      acc[curr.country] = {
        label: curr.country,
        color: `var(--color-chart-${(index % 5) + 1})`,
      };
      return acc;
    },
    {
      totalSalary: { label: "Total Payroll" },
    } as ChartConfig,
  );

  return { chartCountryData, countryConfig };
}

export function buildComponentChartData(data: DashboardStatsSchema) {
  const chartComponentData = [
    {
      name: "base",
      value: data.component_totals.base_salary_usd_minor_units / 100,
      fill: "var(--color-base)",
    },
    {
      name: "housing",
      value: data.component_totals.housing_allowance_usd_minor_units / 100,
      fill: "var(--color-housing)",
    },
    {
      name: "equity",
      value: data.component_totals.equity_usd_minor_units / 100,
      fill: "var(--color-equity)",
    },
    {
      name: "other",
      value: data.component_totals.other_allowance_usd_minor_units / 100,
      fill: "var(--color-other)",
    },
  ].filter((item) => item.value > 0);

  const componentConfig = {
    value: { label: "Value" },
    base: { label: "Base Salary", color: "var(--color-chart-1)" },
    housing: { label: "Housing", color: "var(--color-chart-2)" },
    equity: { label: "Equity", color: "var(--color-chart-3)" },
    other: { label: "Other", color: "var(--color-chart-4)" },
  } satisfies ChartConfig;

  return { chartComponentData, componentConfig };
}

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

  const { chartCountryData, countryConfig } = buildCountryChartData(data);
  const { chartComponentData, componentConfig } = buildComponentChartData(data);

  const chartDeptData = data.department_averages.map((d, index) => ({
    department: d.department,
    averageSalary: d.average_salary_usd_minor_units / 100,
    fill: `var(--color-chart-${(index % 5) + 1})`,
  }));

  const deptConfig = chartDeptData.reduce(
    (acc, curr, index) => {
      acc[curr.department] = {
        label: curr.department,
        color: `var(--color-chart-${(index % 5) + 1})`,
      };
      return acc;
    },
    {
      averageSalary: { label: "Avg Salary" },
    } as ChartConfig,
  );

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
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active workforce globally</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Avg CTC</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(globalAvgCtcMinor, "USD")}</div>
            <p className="text-xs text-muted-foreground">Mean cost-to-company</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annual Payroll</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayrollMinor, "USD")}</div>
            <p className="text-xs text-muted-foreground">Aggregated yearly spend</p>
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
