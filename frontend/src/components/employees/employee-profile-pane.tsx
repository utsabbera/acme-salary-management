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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import type { CountryRead, CurrencyRead, DepartmentRead, EmployeeRead } from "@/lib/generated";
import { getEmployeeEmployeesEmployeeIdGet } from "@/lib/generated";
import { getErrorMessage } from "@/lib/utils";
import { DeleteEmployeeDialog } from "./delete-employee-dialog";
import { EditEmployeeDialog } from "./edit-employee-dialog";
import { UpdateSalaryDialog } from "./update-salary-dialog";

type EmployeeData = Awaited<ReturnType<typeof getEmployeeEmployeesEmployeeIdGet>>["data"];

import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { SalaryBreakdown } from "./salary-breakdown";

interface EmployeeProfilePaneProps {
  departments: DepartmentRead[];
  countries: CountryRead[];
  currencies: CurrencyRead[];
}

export function EmployeeProfilePane({
  departments,
  countries,
  currencies,
}: EmployeeProfilePaneProps) {
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
        .then((response) => {
          if (response.error) {
            toast.error(`Could not load employee details. ${getErrorMessage(response.error)}`);
          } else {
            setEmployee(response.data);
          }
        })
        .catch((err) => toast.error(`Could not load employee details. ${getErrorMessage(err)}`))
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
        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : !employee ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Employee not found</h2>
            <p className="text-muted-foreground">
              The employee you are looking for does not exist or could not be loaded.
            </p>
            <Button variant="outline" onClick={handleClose}>
              Close Pane
            </Button>
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
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    Employee Details
                  </CardTitle>
                  <EditEmployeeDialog
                    employee={employee as unknown as EmployeeRead}
                    departments={departments}
                    countries={countries}
                    onSuccess={fetchEmployee}
                    trigger={
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    }
                  />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">Department</p>
                      <p className="text-sm text-muted-foreground">{employee.department.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">Country</p>
                      <p className="text-sm text-muted-foreground">{employee.country.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Compensation Section */}
              <Card className="shadow-none border-muted/60 bg-transparent">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    Current Compensation
                  </CardTitle>
                  <UpdateSalaryDialog
                    employeeId={employee.id}
                    currencies={currencies}
                    currentSalary={employee.current_salary}
                    onSuccess={fetchEmployee}
                    trigger={
                      <Button variant="outline" size="sm">
                        Adjust
                      </Button>
                    }
                  />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <BanknoteIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">
                        Total Compensation
                      </p>
                      <p className="text-4xl font-bold tracking-tight text-foreground">
                        {employee.current_salary
                          ? formatCurrency(
                              employee.current_salary.salary_minor_units,
                              employee.current_salary.currency.code,
                            )
                          : "N/A"}
                      </p>
                      {employee.current_salary && (
                        <div className="pt-4">
                          <SalaryBreakdown item={employee.current_salary} />
                        </div>
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
                                  historyItem.currency.code,
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
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No salary history available.</p>
                  )}
                </CardContent>
              </Card>

              {/* Danger Zone Section */}
              <Card className="shadow-none border-red-500/20 bg-red-50/50 dark:bg-red-950/10 mt-8">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-widest text-red-600 dark:text-red-400">
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      Delete Employee
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Permanently remove this employee from the system.
                    </p>
                  </div>
                  <DeleteEmployeeDialog
                    employee={employee as unknown as EmployeeRead}
                    onSuccess={handleClose}
                    trigger={
                      <Button variant="destructive" size="sm">
                        Delete Employee
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
