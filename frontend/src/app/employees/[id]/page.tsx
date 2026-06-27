import { BanknoteIcon, BriefcaseIcon, CalendarIcon, MapPinIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { getEmployeeEmployeesEmployeeIdGet } from "@/lib/generated";

interface EmployeeProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(value / 100);
};

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
};

export default async function EmployeeProfilePage({ params }: EmployeeProfilePageProps) {
  const { id } = await params;
  const employeeId = parseInt(id, 10);
  if (Number.isNaN(employeeId)) {
    notFound();
  }

  const { data, error } = await getEmployeeEmployeesEmployeeIdGet({
    client: apiClient,
    path: { employee_id: employeeId },
  });

  if (error || !data) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Employee not found</p>
      </div>
    );
  }

  const employee = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold tracking-tight">
        {employee.first_name} {employee.last_name}
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Email</p>
                <p className="text-sm text-muted-foreground">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Department</p>
                <p className="text-sm text-muted-foreground">{employee.department}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <MapPinIcon className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Country</p>
                <p className="text-sm text-muted-foreground">{employee.country}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <BanknoteIcon className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Current Salary</p>
                <p className="text-sm text-muted-foreground font-medium">
                  {employee.current_salary
                    ? formatCurrency(
                        employee.current_salary.salary_minor_units,
                        employee.current_salary.currency,
                      )
                    : "No active salary"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Section */}
        <Card>
          <CardHeader>
            <CardTitle>Salary History</CardTitle>
          </CardHeader>
          <CardContent>
            {employee.salary_history && employee.salary_history.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {employee.salary_history.map((historyItem) => (
                  <div
                    key={historyItem.valid_from}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CalendarIcon className="h-4 w-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border shadow">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900">
                          {formatCurrency(historyItem.salary_minor_units, historyItem.currency)}
                        </div>
                        <time className="text-xs font-medium text-amber-500">
                          {formatDate(historyItem.valid_from)}
                        </time>
                      </div>
                      <div className="text-slate-500 text-sm">
                        {historyItem.valid_to
                          ? `Valid until ${formatDate(historyItem.valid_to)}`
                          : "Current active salary"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No salary history available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
