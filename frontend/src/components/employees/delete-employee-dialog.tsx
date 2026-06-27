"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";
import type { EmployeeRead } from "@/lib/generated";
import { deleteEmployeeEmployeesEmployeeIdDelete } from "@/lib/generated";

interface DeleteEmployeeDialogProps {
  employee: EmployeeRead;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  redirectTo?: string;
}

export function DeleteEmployeeDialog({
  employee,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
  redirectTo,
}: DeleteEmployeeDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const router = useRouter();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  const handleDelete = async () => {
    try {
      const { error } = await deleteEmployeeEmployeesEmployeeIdDelete({
        client: apiClient,
        path: { employee_id: employee.id },
      });

      if (error) {
        console.error("Failed to delete employee:", error);
        return;
      }

      setOpen(false);
      onSuccess?.();

      if (redirectTo) {
        router.push(redirectTo as never);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-medium text-foreground">
              {employee.first_name} {employee.last_name}
            </span>
            's record from the system.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:space-x-0">
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
