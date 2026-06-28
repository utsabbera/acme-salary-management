"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
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

      <Card data-testid="component-chart">
        <CardHeader>
          <CardTitle>Spend by Component</CardTitle>
          <CardDescription>Breakdown of total compensation costs</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={componentConfig} className="min-h-[250px] w-full">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartComponentData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                strokeWidth={5}
                paddingAngle={2}
              >
                {chartComponentData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
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
          <ChartContainer config={distributionConfig} className="min-h-[250px] w-full">
            <ComposedChart
              data={chartDistributionData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="department" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis
                type="number"
                tickFormatter={(value) => `$${value / 1000}k`}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="range" fill="var(--color-chart-5)" radius={[4, 4, 4, 4]} barSize={40} />
              <Line
                dataKey="median"
                stroke="none"
                dot={{ fill: "var(--color-chart-1)", r: 5, strokeWidth: 2, stroke: "white" }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
