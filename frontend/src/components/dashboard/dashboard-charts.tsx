"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  Rectangle,
  Sector,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DepartmentData {
  department: string;
  averageSalary: number;
  fill?: string;
}

interface CountryData {
  country: string;
  totalSalary: number;
  fill: string;
}

interface ComponentData {
  name: string;
  value: number;
  fill: string;
}

interface DistributionData {
  department: string;
  range: [number, number];
  median: number;
  fill: string;
}

interface DashboardChartsProps {
  chartDeptData: DepartmentData[];
  chartCountryData: CountryData[];
  chartComponentData: ComponentData[];
  chartDistributionData: DistributionData[];
  deptConfig: ChartConfig;
  countryConfig: ChartConfig;
  componentConfig: ChartConfig;
  distributionConfig: ChartConfig;
}

export const formatSalaryTick = (value: number) => `$${value / 1000}k`;

export const formatCurrencyTooltip = (value: unknown) => {
  if (Array.isArray(value) && value.length >= 2) {
    return `$${Number(value[0]).toLocaleString()} - $${Number(value[1]).toLocaleString()}`;
  }
  return `$${Number(value).toLocaleString()}`;
};

export function DashboardCharts({
  chartDeptData,
  chartCountryData,
  chartComponentData,
  chartDistributionData,
  deptConfig,
  countryConfig,
  componentConfig,
  distributionConfig,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card data-testid="department-chart">
        <CardHeader>
          <CardTitle>Average Salary by Department</CardTitle>
          <CardDescription>Mean compensation across different business units</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={deptConfig} className="h-[350px] w-full">
            <BarChart
              accessibilityLayer
              data={chartDeptData}
              layout="vertical"
              margin={{ top: 20, right: 20, left: 20, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="department"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={75}
              />
              <XAxis type="number" hide />
              <ChartTooltip
                cursor={false}
                animationDuration={150}
                content={<ChartTooltipContent hideLabel valueFormatter={formatCurrencyTooltip} />}
              />
              <Bar
                dataKey="averageSalary"
                barSize={32}
                shape={(props) => (
                  <Rectangle {...props} fill={props.payload.fill} radius={[0, 4, 4, 0]} />
                )}
              />
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
          <ChartContainer config={countryConfig} className="h-[350px] w-full">
            <BarChart
              accessibilityLayer
              data={chartCountryData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="country"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="number"
                tickFormatter={formatSalaryTick}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip
                cursor={false}
                animationDuration={150}
                content={<ChartTooltipContent hideLabel valueFormatter={formatCurrencyTooltip} />}
              />
              <Bar
                dataKey="totalSalary"
                maxBarSize={48}
                shape={(props) => (
                  <Rectangle {...props} fill={props.payload.fill} radius={[4, 4, 0, 0]} />
                )}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card data-testid="component-chart">
        <CardHeader>
          <CardTitle>Spend by Component</CardTitle>
          <CardDescription>Breakdown of total compensation costs</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={componentConfig} className="mx-auto aspect-square max-h-[350px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                animationDuration={150}
                content={<ChartTooltipContent hideLabel valueFormatter={formatCurrencyTooltip} />}
              />
              <Pie
                data={chartComponentData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
                paddingAngle={2}
                shape={(props) => <Sector {...props} fill={props.payload.fill} />}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-4 justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card data-testid="distribution-chart">
        <CardHeader>
          <CardTitle>Pay Distribution across Roles</CardTitle>
          <CardDescription>Salary band (middle 50%) and median by department</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={distributionConfig} className="h-[350px] w-full">
            <ComposedChart
              data={chartDistributionData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="department"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="number"
                tickFormatter={formatSalaryTick}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip
                cursor={false}
                animationDuration={150}
                content={<ChartTooltipContent valueFormatter={formatCurrencyTooltip} />}
              />
              <Bar
                dataKey="range"
                fill="var(--color-range)"
                radius={[4, 4, 4, 4]}
                maxBarSize={40}
              />
              <Line
                dataKey="median"
                stroke="var(--color-median)"
                strokeWidth={0}
                dot={{ fill: "var(--color-median)", r: 5, strokeWidth: 2, stroke: "white" }}
                activeDot={{ r: 7 }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
