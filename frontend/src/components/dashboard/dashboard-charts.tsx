"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DepartmentData {
  department: string;
  averageSalary: number;
}

interface CountryData {
  country: string;
  totalSalary: number;
  fill: string;
}

interface DashboardChartsProps {
  chartDeptData: DepartmentData[];
  chartCountryData: CountryData[];
  deptConfig: ChartConfig;
  countryConfig: ChartConfig;
}

export function DashboardCharts({
  chartDeptData,
  chartCountryData,
  deptConfig,
  countryConfig,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card data-testid="department-chart">
        <CardHeader>
          <CardTitle>Average Salary by Department</CardTitle>
          <CardDescription>Mean compensation across different business units</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={deptConfig} className="min-h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={chartDeptData}
              margin={{ top: 20, right: 20, left: 20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="department" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="averageSalary" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card data-testid="country-chart">
        <CardHeader>
          <CardTitle>Total Payroll by Country</CardTitle>
          <CardDescription>Distribution of salary expenses globally</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={countryConfig} className="min-h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={chartCountryData}
              margin={{ top: 20, right: 20, left: 20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="country" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="totalSalary" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
