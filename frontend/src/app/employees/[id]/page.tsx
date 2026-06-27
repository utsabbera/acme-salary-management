import { ArrowLeftIcon, BanknoteIcon, BriefcaseIcon, CalendarIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { getEmployeeEmployeesEmployeeIdGet } from "@/lib/generated";

function formatCurrency(minorUnits: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(minorUnits / 100);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function EmployeePage({ params }: { params: { id: string } }) {
  const employeeId = parseInt(params.id, 10);
  if (Number.isNaN(employeeId)) {
    notFound();
  }

  try {
    const response = await getEmployeeEmployeesEmployeeIdGet({
      client: apiClient,
      path: { employee_id: employeeId },
    });

    if (!response.data) {
      notFound();
    }

    const employee = response.data;

    return (
      <div className="container py-10 max-w-4xl">
        <div className="mb-8 flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            render={<Link href="/employees" aria-label="Back to employees" />}
            nativeButton={false}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-muted-foreground">{employee.email}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  {employee.salary_history.map((historyItem, idx) => (
                    <div
                      key={historyItem.valid_from}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-4 rounded-lg border shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-2xl tracking-tight text-foreground">
                            {formatCurrency(historyItem.salary_minor_units, historyItem.currency)}
                          </h4>
                          {idx === 0 && !historyItem.valid_to && (
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-md">
                              Current
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          <time dateTime={historyItem.valid_from}>
                            {formatDate(historyItem.valid_from)}
                          </time>
                          {historyItem.valid_to && (
                            <>
                              <span>→</span>
                              <time dateTime={historyItem.valid_to}>
                                {formatDate(historyItem.valid_to)}
                              </time>
                            </>
                          )}
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
  } catch (_error) {
    notFound();
  }
}
