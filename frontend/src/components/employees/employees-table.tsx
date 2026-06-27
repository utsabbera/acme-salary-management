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
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
  if (employees.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border text-muted-foreground">
        No employees found.
      </div>
    );
  }

  const formatCurrency = (value: string, currency: string) => {
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
            <TableHead className="text-right">Salary</TableHead>
            <TableHead className="text-right">USD Equivalent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <EmployeeRow key={employee.id} employee={employee} formatCurrency={formatCurrency} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmployeeRow({
  employee,
  formatCurrency,
}: {
  employee: EmployeeRead;
  formatCurrency: (v: string, c: string) => string;
}) {
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          {employee.first_name} {employee.last_name}
        </TableCell>
        <TableCell>{employee.email}</TableCell>
        <TableCell>{employee.department}</TableCell>
        <TableCell>{employee.country}</TableCell>
        <TableCell className="text-right">
          {formatCurrency(employee.salary, employee.currency)}
        </TableCell>
        <TableCell className="text-right">{formatCurrency(employee.salary_usd, "USD")}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" className="h-8 w-8 p-0" />}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>Edit</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <EditEmployeeDialog
        employee={employee}
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
