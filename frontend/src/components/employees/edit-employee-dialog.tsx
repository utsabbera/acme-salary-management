"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { EmployeeRead } from "@/lib/generated";
import { EmployeeForm, type EmployeeFormData } from "./employee-form";

interface EditEmployeeDialogProps {
  employee: EmployeeRead;
  trigger?: React.ReactElement;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditEmployeeDialog({
  employee,
  trigger,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditEmployeeDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  const handleSubmit = (data: EmployeeFormData) => {
    // In the real app, this will call the API
    console.log("Update employee", data);
    setOpen(false);
    onSuccess?.();
  };

  // Convert employee to form data matching the schema
  const defaultValues: Partial<EmployeeFormData> = {
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    department: employee.department,
    country: employee.country,
    salary: Number(employee.salary),
    currency: employee.currency,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update the details for the employee. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <EmployeeForm onSubmit={handleSubmit} mode="edit" defaultValues={defaultValues} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
