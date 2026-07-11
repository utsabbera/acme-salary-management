"use client";

import {
  ArrowRightIcon,
  BanknoteIcon,
  BriefcaseIcon,
  CalendarIcon,
  CoinsIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useTopLoader } from "nextjs-toploader";
import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type {
  CountryRead,
  CurrencyRead,
  DepartmentRead,
  EmployeeRead,
  ExchangeRateRead,
  SalaryHistoryItem,
} from "@/lib/generated";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { ClosePaneButton } from "./close-pane-button";
import { DeleteEmployeeDialog } from "./delete-employee-dialog";
import { EditEmployeeDialog } from "./edit-employee-dialog";
import { NextPrevButtons } from "./next-prev-buttons";
import { SalaryBreakdown } from "./salary-breakdown";
import { UpdateSalaryDialog } from "./update-salary-dialog";

interface EmployeeProfilePaneProps {
  employee?: EmployeeRead & { salary_history?: SalaryHistoryItem[] };
  departments: DepartmentRead[];
  countries: CountryRead[];
  currencies: CurrencyRead[];
  exchangeRates: ExchangeRateRead[];
  prevId?: number | null;
  nextId?: number | null;
  prevOffset?: number | null;
  nextOffset?: number | null;
}

export function EmployeeProfilePane({
  employee,
  departments,
  countries,
  currencies,
  exchangeRates,
  prevId = null,
  nextId = null,
  prevOffset = null,
  nextOffset = null,
}: EmployeeProfilePaneProps) {
  const topLoader = useTopLoader();
  const [isUsd, setIsUsd] = React.useState(false);

  React.useEffect(() => {
    const _id = employee?.id;
    topLoader.done();
  }, [employee?.id, topLoader]);

  const renderValue = (minor_units: number, code: string) => {
    if (isUsd) {
      const exchangeRate = exchangeRates?.find((er) => er.currency === code)?.rate;
      if (!exchangeRate) {
        return (
          <Tooltip>
            <TooltipTrigger className="cursor-help decoration-dotted underline underline-offset-4 text-muted-foreground">
              ≈ USD N/A
            </TooltipTrigger>
            <TooltipContent>Exchange rate unavailable</TooltipContent>
          </Tooltip>
        );
      }
      return formatCurrency(minor_units * exchangeRate, "USD");
    }
    return formatCurrency(minor_units, code);
  };

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-6">
        <h2 className="text-2xl font-semibold tracking-tight">Employee not found</h2>
        <p className="text-muted-foreground">
          The employee you are looking for does not exist or could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-background">
        <div className="sticky top-0 z-10 flex items-center gap-1 px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <ClosePaneButton />
          <div className="w-px h-4 bg-border mx-1" />
          <NextPrevButtons
            prevId={prevId}
            nextId={nextId}
            prevOffset={prevOffset}
            nextOffset={nextOffset}
          />
          <div className="flex-1" />
          {employee?.current_salary && (
            <div className="flex items-center bg-muted/30 p-0.5 rounded-lg border border-border/40">
              <button
                type="button"
                onClick={() => setIsUsd(false)}
                className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md transition-all ${
                  !isUsd
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                aria-label="Show local currency"
              >
                {employee.current_salary.currency.code}
              </button>
              <button
                type="button"
                onClick={() => setIsUsd(true)}
                className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md transition-all ${
                  isUsd
                    ? "bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-600/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                aria-label="Show USD"
              >
                USD
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="space-y-8 max-w-3xl mx-auto pb-12">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border">
                <AvatarFallback className="bg-primary/5 text-primary text-2xl font-medium">
                  {employee.first_name[0]}
                  {employee.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {employee.first_name} {employee.last_name}
                </h1>
                <p className="text-muted-foreground mt-1">{employee.email}</p>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Personal Info Section */}
              <Card className="shadow-none border-muted/60 bg-transparent group/card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    Employee Details
                  </CardTitle>
                  <EditEmployeeDialog
                    employee={employee}
                    departments={departments}
                    countries={countries}
                    trigger={
                      <Button variant="outline" size="sm">
                        <PencilIcon className="mr-2 h-4 w-4" /> Edit
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
              <Card className="shadow-none border-muted/60 bg-transparent group/card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    Current Compensation
                  </CardTitle>
                  <UpdateSalaryDialog
                    employeeId={employee.id}
                    currencies={currencies}
                    currentSalary={employee.current_salary}
                    defaultCurrencyCode={employee.country?.default_currency?.code}
                    trigger={
                      <Button variant="outline" size="sm">
                        <CoinsIcon className="mr-2 h-4 w-4" /> Adjust
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
                      <div className="flex items-center gap-3">
                        <p className="text-4xl font-bold tracking-tight text-foreground font-mono tabular-nums">
                          {employee.current_salary
                            ? renderValue(
                                employee.current_salary.salary_minor_units,
                                employee.current_salary.currency.code,
                              )
                            : "N/A"}
                        </p>
                      </div>
                      {employee.current_salary && (
                        <div className="pt-2">
                          <SalaryBreakdown
                            item={employee.current_salary}
                            isUsd={isUsd}
                            exchangeRate={
                              exchangeRates?.find(
                                (er) => er.currency === employee.current_salary?.currency.code,
                              )?.rate
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Section */}
              <Card className="shadow-none border-muted/60 bg-transparent group/card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    Compensation History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.salary_history && employee.salary_history.length > 0 ? (
                    <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-5 before:-translate-x-1/2 before:w-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {employee.salary_history.map(
                        (historyItem: SalaryHistoryItem, idx: number) => (
                          <div
                            key={historyItem.valid_from}
                            className="relative flex items-start gap-6 group is-active"
                          >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted text-muted-foreground shadow-sm shrink-0 z-10">
                              <CalendarIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 bg-card p-4 rounded-xl border shadow-sm transition-all hover:shadow-md">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-2xl tracking-tight text-foreground font-mono tabular-nums">
                                    {renderValue(
                                      historyItem.salary_minor_units,
                                      historyItem.currency.code,
                                    )}
                                  </h4>
                                </div>
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
                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                    <time dateTime={historyItem.valid_to}>
                                      {formatDate(historyItem.valid_to)}
                                    </time>
                                  </>
                                )}
                              </div>
                              <div className="mt-2">
                                <SalaryBreakdown
                                  item={historyItem}
                                  isUsd={isUsd}
                                  exchangeRate={
                                    exchangeRates?.find(
                                      (er) => er.currency === historyItem.currency.code,
                                    )?.rate
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No salary history available.</p>
                  )}
                </CardContent>
              </Card>

              {/* Danger Zone Section */}
              <Card className="shadow-none border-red-500/20 bg-red-50/50 dark:bg-red-950/10 mt-8 group/card">
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
                    employee={employee}
                    trigger={
                      <Button variant="destructive" size="sm">
                        <TrashIcon className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
