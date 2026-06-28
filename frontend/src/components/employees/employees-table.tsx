"use client";

import { MoreHorizontal } from "lucide-react";
import * as React from "react";
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
import { DeleteEmployeeDialog } from "./delete-employee-dialog";
import { EditEmployeeDialog } from "./edit-employee-dialog";

interface EmployeesTableProps {
  employees: EmployeeRead[];
  departments: import("@/lib/generated").DepartmentRead[];
  countries: import("@/lib/generated").CountryRead[];
}

export function EmployeesTable({ employees, departments, countries }: EmployeesTableProps) {
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Country</TableHead>
            <TableHead className="text-right">CTC</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { useRouter, useSearchParams } from "next/navigation";

function EmployeeRow({
  employee,
  formatCurrency,
  departments,
  countries,
}: {
  employee: EmployeeRead;
  formatCurrency: (v: number, c: string) => string;
  departments: import("@/lib/generated").DepartmentRead[];
  countries: import("@/lib/generated").CountryRead[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleRowClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("employeeId", employee.id.toString());
    router.push(`?${params.toString()}` as never);
  };

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={handleRowClick}
      >
        <TableCell className="font-medium">
          {employee.first_name} {employee.last_name}
        </TableCell>
        <TableCell>{employee.email}</TableCell>
        <TableCell>{employee.department.name}</TableCell>
        <TableCell>{employee.country.name}</TableCell>
        <TableCell className="text-right">
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
