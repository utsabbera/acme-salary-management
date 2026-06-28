"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";
import type { EmployeeRead } from "@/lib/generated";
import { updateEmployeeEmployeesEmployeeIdPatch } from "@/lib/generated";
import { getErrorMessage } from "@/lib/utils";
import { EmployeeForm, type EmployeeFormData } from "./employee-form";

interface EditEmployeeDialogProps {
  employee: EmployeeRead;
  departments: import("@/lib/generated").DepartmentRead[];
  countries: import("@/lib/generated").CountryRead[];
  trigger?: React.ReactElement;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditEmployeeDialog({
  employee,
  departments,
  countries,
  trigger,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditEmployeeDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  const router = useRouter();

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      const { error } = await updateEmployeeEmployeesEmployeeIdPatch({
        client: apiClient,
        path: { employee_id: employee.id },
        body: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          department_id: data.department_id,
          country_code: data.country_code,
        },
      });

      if (error) {
        toast.error(`Could not update employee. ${getErrorMessage(error)}`);
        return;
      }

      setOpen(false);
      onSuccess?.();
      router.refresh();
    } catch (err) {
      toast.error(`Could not update employee. ${getErrorMessage(err)}`);
    }
  };

  const defaultValues: Partial<EmployeeFormData> = {
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    department_id: employee.department.id,
    country_code: employee.country.code,
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
          <EmployeeForm
            onSubmit={handleSubmit}
            mode="edit"
            defaultValues={defaultValues}
            departments={departments}
            countries={countries}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
