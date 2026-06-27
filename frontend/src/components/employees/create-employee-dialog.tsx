"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
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
import { EmployeeForm, type EmployeeFormData } from "./employee-form";

interface CreateEmployeeDialogProps {
  trigger?: React.ReactElement;
  onSuccess?: () => void;
}

export function CreateEmployeeDialog({ trigger, onSuccess }: CreateEmployeeDialogProps) {
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
          department: data.department,
          country: data.country,
        },
      });

      if (error) {
        console.error("Failed to create employee:", error);
        return;
      }

      setOpen(false);
      onSuccess?.();
      router.refresh();
    } catch (err) {
      console.error("Error creating employee:", err);
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
        <div className="py-4">
          <EmployeeForm onSubmit={handleSubmit} mode="create" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
