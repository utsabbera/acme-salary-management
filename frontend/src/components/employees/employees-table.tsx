"use client";

import { MoreHorizontal } from "lucide-react";
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

  const isSelected = searchParams.get("employeeId") === employee.id.toString();

  const handleRowClick = () => {
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
