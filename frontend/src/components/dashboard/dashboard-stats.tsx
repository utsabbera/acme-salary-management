import { CircleDollarSign, Globe, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            <div className="flex flex-col p-6 justify-center">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Employees</span>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-3xl font-bold mt-2 tracking-tight font-mono tabular-nums">
                {totalEmployees}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Active workforce globally</p>
            </div>

            <div className="flex flex-col p-6 justify-center">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Global Avg CTC</span>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-3xl font-bold mt-2 tracking-tight font-mono tabular-nums">
                {formatCurrency(globalAvgCtcMinor, "USD")}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Mean cost-to-company</p>
            </div>

            <div className="flex flex-col p-6 justify-center bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Annual Payroll
                </span>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-3xl font-bold mt-2 tracking-tight text-primary font-mono tabular-nums">
                {formatCurrency(totalPayrollMinor, "USD")}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Aggregated yearly spend</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
