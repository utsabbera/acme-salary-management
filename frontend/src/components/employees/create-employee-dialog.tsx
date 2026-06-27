import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmployeeForm, type EmployeeFormData } from "./employee-form";

interface CreateEmployeeDialogProps {
  trigger?: React.ReactElement;
  onSuccess?: () => void;
}

export function CreateEmployeeDialog({ trigger, onSuccess }: CreateEmployeeDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (data: EmployeeFormData) => {
    // In the real app, this will call the API
    console.log("Create employee", data);
    setOpen(false);
    onSuccess?.();
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
