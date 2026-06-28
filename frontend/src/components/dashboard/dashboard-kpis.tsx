import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DepartmentData {
  department: string;
  average_salary_usd_minor_units: number;
}

interface CountryData {
  country: string;
  total_salary_usd_minor_units: number;
}

interface DashboardKpisProps {
  departmentAverages: DepartmentData[];
  countryTotals: CountryData[];
}

export function DashboardKpis({ departmentAverages, countryTotals }: DashboardKpisProps) {
  const formatCurrency = (amountMinor: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amountMinor / 100);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {departmentAverages.map((dept) => (
        <Card key={dept.department}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dept.department} Avg Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dept.average_salary_usd_minor_units)}
            </div>
          </CardContent>
        </Card>
      ))}
      {countryTotals.map((country) => (
        <Card key={country.country}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{country.country} Total Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(country.total_salary_usd_minor_units)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
