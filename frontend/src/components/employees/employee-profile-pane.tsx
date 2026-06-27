"use client";

import {
  BanknoteIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChevronsRight,
  MapPinIcon,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { getEmployeeEmployeesEmployeeIdGet } from "@/lib/generated";
import { UpdateSalaryDialog } from "./update-salary-dialog";

type EmployeeData = Awaited<ReturnType<typeof getEmployeeEmployeesEmployeeIdGet>>["data"];

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

function SalaryBreakdown({
  item,
}: {
  item: {
    base_salary_minor_units: number;
    housing_allowance_minor_units?: number | null;
    equity_minor_units?: number | null;
    other_allowance_minor_units?: number | null;
    currency: string;
  };
}) {
  if (!item) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm border-t pt-4">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Base Salary</span>
        <span className="font-medium text-foreground">
          {formatCurrency(item.base_salary_minor_units, item.currency)}
        </span>
      </div>
      {item.housing_allowance_minor_units ? (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Housing</span>
          <span className="font-medium text-foreground">
            {formatCurrency(item.housing_allowance_minor_units, item.currency)}
          </span>
        </div>
      ) : null}
      {item.equity_minor_units ? (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Equity</span>
          <span className="font-medium text-foreground">
            {formatCurrency(item.equity_minor_units, item.currency)}
          </span>
        </div>
      ) : null}
      {item.other_allowance_minor_units ? (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Other</span>
          <span className="font-medium text-foreground">
            {formatCurrency(item.other_allowance_minor_units, item.currency)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function EmployeeProfilePane() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const employeeIdParam = searchParams.get("employeeId");

  const [employee, setEmployee] = React.useState<EmployeeData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchEmployee = React.useCallback(() => {
    if (employeeIdParam) {
      setIsLoading(true);
      const employeeId = parseInt(employeeIdParam, 10);
      getEmployeeEmployeesEmployeeIdGet({
        client: apiClient,
        path: { employee_id: employeeId },
      })
        .then((response) => setEmployee(response.data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setEmployee(null);
    }
  }, [employeeIdParam]);

  React.useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  if (!employeeIdParam) {
    return null;
  }

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("employeeId");
    router.push(`?${params.toString()}` as never);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Notion-style Sticky Toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-1 px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Close pane"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          render={
            <Link href={`/employees/${employeeIdParam}` as never} aria-label="Open in full page" />
          }
          nativeButton={false}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-10">
        {isLoading || !employee ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <div className="space-y-8 max-w-3xl mx-auto pb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-muted-foreground mt-1">{employee.email}</p>
            </div>

            <div className="grid gap-6">
              {/* Personal Info Section */}
              <Card className="shadow-none border-muted/60 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">Department</p>
                      <p className="text-sm text-muted-foreground">{employee.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">Country</p>
                      <p className="text-sm text-muted-foreground">{employee.country}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <BanknoteIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">CTC</p>
                      <p className="text-2xl font-bold tracking-tight text-foreground">
                        {employee.current_salary
                          ? formatCurrency(
                              employee.current_salary.salary_minor_units,
                              employee.current_salary.currency,
                            )
                          : "N/A"}
                      </p>
                      {employee.current_salary && (
                        <SalaryBreakdown item={employee.current_salary} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Section */}
              <Card className="shadow-none border-muted/60 bg-transparent">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    Compensation History
                  </CardTitle>
                  <UpdateSalaryDialog
                    employeeId={employee.id}
                    currentSalary={employee.current_salary}
                    onSuccess={fetchEmployee}
                    trigger={
                      <Button variant="outline" size="sm">
                        Adjust
                      </Button>
                    }
                  />
                </CardHeader>
                <CardContent>
                  {employee.salary_history && employee.salary_history.length > 0 ? (
                    <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-5 before:-translate-x-1/2 before:w-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {employee.salary_history.map((historyItem, idx) => (
                        <div
                          key={historyItem.valid_from}
                          className="relative flex items-start gap-6 group is-active"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted text-muted-foreground shadow-sm shrink-0 z-10">
                            <CalendarIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 bg-card p-4 rounded-xl border shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold text-2xl tracking-tight text-foreground">
                                {formatCurrency(
                                  historyItem.salary_minor_units,
                                  historyItem.currency,
                                )}
                              </h4>
                              {idx === 0 && !historyItem.valid_to && (
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                  Current
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
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
                            <SalaryBreakdown item={historyItem} />
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
        )}
      </div>
    </div>
  );
}
