"use client";

import { BanknoteIcon, BriefcaseIcon, CalendarIcon, MapPinIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { type EmployeeDetailRead, getEmployeeEmployeesEmployeeIdGet } from "@/lib/generated";

export function EmployeeProfileSheet() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId");

  const [employee, setEmployee] = React.useState<EmployeeDetailRead | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!employeeId) {
      setEmployee(null);
      setError(null);
      return;
    }

    async function fetchEmployee() {
      setLoading(true);
      setError(null);

      const { data, error } = await getEmployeeEmployeesEmployeeIdGet({
        client: apiClient,
        path: {
          employee_id: parseInt(employeeId as string, 10),
        },
      });

      if (error) {
        setError("Failed to load employee details");
        setEmployee(null);
      } else if (data) {
        setEmployee(data as EmployeeDetailRead);
      }

      setLoading(false);
    }

    fetchEmployee();
  }, [employeeId]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Remove employeeId from query params
      const params = new URLSearchParams(searchParams.toString());
      params.delete("employeeId");
      router.push(`?${params.toString()}`);
    }
  };

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

  const isOpen = !!employeeId;

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:!max-w-[400px] lg:!max-w-[500px] overflow-y-auto p-6 sm:p-12">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Employee Profile
          </SheetTitle>
          <SheetDescription className="sr-only">
            View salary history and personal information.
          </SheetDescription>
        </SheetHeader>

        <div>
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-2 gap-8 pt-8">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          )}

          {error && <div className="text-destructive font-medium">{error}</div>}

          {!loading && !error && employee && (
            <div className="space-y-12">
              {/* Profile Header */}
              <div>
                <h2 className="text-4xl font-extrabold tracking-tight mb-2">
                  {employee.first_name} {employee.last_name}
                </h2>
                <a
                  href={`mailto:${employee.email}`}
                  className="text-primary hover:underline font-medium"
                >
                  {employee.email}
                </a>

                <div className="grid grid-cols-2 gap-x-4 gap-y-8 mt-10">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      Department
                    </div>
                    <div className="font-medium flex items-center gap-2">
                      <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                      {employee.department}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      Location
                    </div>
                    <div className="font-medium flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                      {employee.country}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      Joined
                    </div>
                    <div className="font-medium flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      {formatDate(employee.created_at)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      Current Salary
                    </div>
                    <div className="font-medium flex items-center gap-2 text-primary">
                      <BanknoteIcon className="w-4 h-4" />
                      {employee.current_salary
                        ? formatCurrency(
                            employee.current_salary.salary_minor_units,
                            employee.current_salary.currency,
                          )
                        : "None"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary History Timeline */}
              <div>
                <h3 className="text-xl font-bold tracking-tight border-b pb-4 mb-6">
                  Salary History
                </h3>

                {employee.salary_history && employee.salary_history.length > 0 ? (
                  <div className="relative pl-6 border-l-2 border-muted space-y-8">
                    {employee.salary_history.map((historyItem, idx) => (
                      <div key={historyItem.valid_from} className="relative">
                        {/* Timeline Node */}
                        <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-background border-2 border-primary ring-4 ring-background" />

                        <div className="bg-muted/30 border border-muted p-5 rounded-lg">
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
                            {formatDate(historyItem.valid_from)}
                            {historyItem.valid_to
                              ? ` - ${formatDate(historyItem.valid_to)}`
                              : " - Present"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    No salary history records found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
