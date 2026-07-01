"use client";

import { MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EmployeeRead } from "@/lib/generated";
import { cn } from "@/lib/utils";
import { DeleteEmployeeDialog } from "./delete-employee-dialog";
import { EditEmployeeDialog } from "./edit-employee-dialog";

interface EmployeesTableProps {
  employees: EmployeeRead[];
  departments: import("@/lib/generated").DepartmentRead[];
  countries: import("@/lib/generated").CountryRead[];
}

export function EmployeesTable({ employees, departments, countries }: EmployeesTableProps) {
  const searchParams = useSearchParams();
  const urlId = searchParams.get("employeeId");
  const [optimisticId, setOptimisticId] = React.useState<string | null>(null);
  const topLoader = useTopLoader();

  React.useEffect(() => {
    if (optimisticId !== null && urlId === optimisticId) {
      setOptimisticId(null);
    }
  }, [urlId, optimisticId]);

  React.useEffect(() => {
    const _ = searchParams.toString();
    topLoader.done();
  }, [searchParams, topLoader]);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setOptimisticId(customEvent.detail);
    };
    window.addEventListener("optimistic-navigate", handler);
    return () => window.removeEventListener("optimistic-navigate", handler);
  }, []);

  if (employees.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border text-muted-foreground">
        No employees found.
      </div>
    );
  }

  const formatCurrency = (value: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(Number(value));
    } catch {
      return `${currency} ${value}`;
    }
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="text-xs uppercase tracking-wider font-semibold">Name</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold">Email</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold">
              Department
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold">
              Country
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wider font-semibold">
              Current Compensation
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wider font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              formatCurrency={formatCurrency}
              departments={departments}
              countries={countries}
              optimisticId={optimisticId}
              setOptimisticId={setOptimisticId}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmployeeRow({
  employee,
  formatCurrency,
  departments,
  countries,
  optimisticId,
  setOptimisticId,
}: {
  employee: EmployeeRead;
  formatCurrency: (v: number, c: string) => string;
  departments: import("@/lib/generated").DepartmentRead[];
  countries: import("@/lib/generated").CountryRead[];
  optimisticId: string | null;
  setOptimisticId: (id: string) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const urlId = searchParams.get("employeeId");
  const isSelected = optimisticId === employee.id.toString() || urlId === employee.id.toString();
  const topLoader = useTopLoader();

  const handleRowClick = () => {
    if (!isSelected) {
      topLoader.start();
    }
    setOptimisticId(employee.id.toString());
    const params = new URLSearchParams(searchParams.toString());
    params.set("employeeId", employee.id.toString());
    router.push(`?${params.toString()}` as never);
  };

  return (
    <>
      <TableRow
        className={cn(
          "cursor-pointer transition-colors",
          isSelected ? "bg-muted hover:bg-muted" : "hover:bg-muted/50",
        )}
        onClick={handleRowClick}
      >
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {employee.first_name[0]}
                {employee.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">
                {employee.first_name} {employee.last_name}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">{employee.email}</TableCell>
        <TableCell>
          <Badge variant="secondary" className="font-normal text-xs">
            {employee.department.name}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="font-normal text-xs">
            {employee.country.name}
          </Badge>
        </TableCell>
        <TableCell className="text-right font-mono tabular-nums">
          {employee.current_salary
            ? formatCurrency(
                employee.current_salary.salary_minor_units / 100,
                employee.current_salary.currency.code,
              )
            : "-"}
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" className="h-8 w-8 p-0" />}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditDialog(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <EditEmployeeDialog
        employee={employee}
        departments={departments}
        countries={countries}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      <DeleteEmployeeDialog
        employee={employee}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
