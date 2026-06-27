"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";
import type { EmployeeRead } from "@/lib/generated";
import { deleteEmployeeEmployeesEmployeeIdDelete } from "@/lib/generated";

interface DeleteEmployeeDialogProps {
  employee: EmployeeRead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteEmployeeDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: DeleteEmployeeDialogProps) {
  const router = useRouter();

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

      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
