"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import {
  addSalaryAdjustmentEmployeesEmployeeIdSalariesPost,
  type CurrentSalary,
} from "@/lib/generated";
import { getErrorMessage } from "@/lib/utils";

const salarySchema = z.object({
  valid_from: z.string().min(1, "Valid from date is required"),
  base_salary: z.coerce.number().min(0, "Base salary must be a positive number"),
  housing_allowance: z.coerce.number().min(0).optional(),
  equity: z.coerce.number().min(0).optional(),
  other_allowance: z.coerce.number().min(0).optional(),
  currency: z.string().min(3, "Currency code must be 3 characters").max(3),
});

export type SalaryFormData = z.infer<typeof salarySchema>;

interface UpdateSalaryDialogProps {
  employeeId: number;
  currentSalary?: CurrentSalary | null;
  trigger?: React.ReactElement;
  onSuccess?: () => void;
}

export function UpdateSalaryDialog({
  employeeId,
  currentSalary,
  trigger,
  onSuccess,
}: UpdateSalaryDialogProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const defaultValues: Partial<SalaryFormData> = currentSalary
    ? {
        currency: currentSalary.currency,
        base_salary: currentSalary.base_salary_minor_units / 100,
        housing_allowance: currentSalary.housing_allowance_minor_units
          ? currentSalary.housing_allowance_minor_units / 100
          : undefined,
        equity: currentSalary.equity_minor_units
          ? currentSalary.equity_minor_units / 100
          : undefined,
        other_allowance: currentSalary.other_allowance_minor_units
          ? currentSalary.other_allowance_minor_units / 100
          : undefined,
      }
    : {
        currency: "USD",
        base_salary: 0,
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof salarySchema>>({
    resolver: zodResolver(salarySchema),
    defaultValues,
  });

  const onSubmit = async (data: SalaryFormData) => {
    try {
      const { error } = await addSalaryAdjustmentEmployeesEmployeeIdSalariesPost({
        client: apiClient,
        path: { employee_id: employeeId },
        body: {
          valid_from: data.valid_from,
          currency: data.currency,
          base_salary_minor_units: Math.round(data.base_salary * 100),
          housing_allowance_minor_units: data.housing_allowance
            ? Math.round(data.housing_allowance * 100)
            : null,
          equity_minor_units: data.equity ? Math.round(data.equity * 100) : null,
          other_allowance_minor_units: data.other_allowance
            ? Math.round(data.other_allowance * 100)
            : null,
        },
      });

      if (error) {
        toast.error(`Could not update salary. ${getErrorMessage(error)}`);
        return;
      }

      setOpen(false);
      onSuccess?.();
      router.refresh();
    } catch (err) {
      toast.error(`Could not update salary. ${getErrorMessage(err)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Adjust Salary</DialogTitle>
          <DialogDescription>
            Record a new compensation package. The previous active salary will be automatically
            closed.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <form
            onSubmit={handleSubmit((data) => onSubmit(data as SalaryFormData))}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid_from">Valid From Date</Label>
                <Input id="valid_from" type="date" {...register("valid_from")} />
                {errors.valid_from && (
                  <span className="text-sm text-destructive">{errors.valid_from.message}</span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" {...register("currency")} />
                {errors.currency && (
                  <span className="text-sm text-destructive">{errors.currency.message}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_salary">Base Salary</Label>
                <Input id="base_salary" type="number" step="0.01" {...register("base_salary")} />
                {errors.base_salary && (
                  <span className="text-sm text-destructive">{errors.base_salary.message}</span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="housing_allowance">Housing Allowance</Label>
                <Input
                  id="housing_allowance"
                  type="number"
                  step="0.01"
                  {...register("housing_allowance")}
                />
                {errors.housing_allowance && (
                  <span className="text-sm text-destructive">
                    {errors.housing_allowance.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equity">Equity</Label>
                <Input id="equity" type="number" step="0.01" {...register("equity")} />
                {errors.equity && (
                  <span className="text-sm text-destructive">{errors.equity.message}</span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="other_allowance">Other Allowance</Label>
                <Input
                  id="other_allowance"
                  type="number"
                  step="0.01"
                  {...register("other_allowance")}
                />
                {errors.other_allowance && (
                  <span className="text-sm text-destructive">{errors.other_allowance.message}</span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Adjustment</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
