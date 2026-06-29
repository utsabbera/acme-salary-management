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
import { createEmployeeEmployeesPost } from "@/lib/generated";
import { getErrorMessage } from "@/lib/utils";
import { EmployeeForm, type EmployeeFormData } from "./employee-form";

interface CreateEmployeeDialogProps {
  departments: import("@/lib/generated").DepartmentRead[];
  countries: import("@/lib/generated").CountryRead[];
  trigger?: React.ReactElement;
  onSuccess?: () => void;
}

export function CreateEmployeeDialog({
  departments,
  countries,
  trigger,
  onSuccess,
}: CreateEmployeeDialogProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      const { error } = await createEmployeeEmployeesPost({
        client: apiClient,
        body: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          department_id: data.department_id,
          country_code: data.country_code,
        },
      });

      if (error) {
        toast.error(`Could not create employee. ${getErrorMessage(error)}`);
        return;
      }

      setOpen(false);
      onSuccess?.();
      router.refresh();
    } catch (err) {
      toast.error(`Could not create employee. ${getErrorMessage(err)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Employee</DialogTitle>
          <DialogDescription>
            Enter the details for the new employee. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <EmployeeForm
          onSubmit={handleSubmit}
          mode="create"
          departments={departments}
          countries={countries}
        />
      </DialogContent>
    </Dialog>
  );
}
