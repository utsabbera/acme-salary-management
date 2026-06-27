"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const employeeSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  country: z.string().min(1, "Country is required"),
  salary: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .pipe(z.number().min(0, "Salary must be a positive number")),
  currency: z.string().min(1, "Currency is required"),
  valid_from: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => void;
  mode: "create" | "edit";
  defaultValues?: Partial<EmployeeFormData>;
}

export function EmployeeForm({ onSubmit, mode, defaultValues }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data as EmployeeFormData))}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            defaultValue={defaultValues?.first_name}
            {...register("first_name")}
          />
          {errors.first_name && (
            <span className="text-sm text-destructive">{errors.first_name.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            defaultValue={defaultValues?.last_name}
            {...register("last_name")}
          />
          {errors.last_name && (
            <span className="text-sm text-destructive">{errors.last_name.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" defaultValue={defaultValues?.email} {...register("email")} />
        {errors.email && <span className="text-sm text-destructive">{errors.email.message}</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            defaultValue={defaultValues?.department}
            {...register("department")}
          />
          {errors.department && (
            <span className="text-sm text-destructive">{errors.department.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" defaultValue={defaultValues?.country} {...register("country")} />
          {errors.country && (
            <span className="text-sm text-destructive">{errors.country.message}</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.salary}
            {...register("salary")}
          />
          {errors.salary && (
            <span className="text-sm text-destructive">{errors.salary.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" defaultValue={defaultValues?.currency} {...register("currency")} />
          {errors.currency && (
            <span className="text-sm text-destructive">{errors.currency.message}</span>
          )}
        </div>
      </div>
      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="valid_from">Valid From</Label>
          <Input
            id="valid_from"
            type="date"
            defaultValue={defaultValues?.valid_from}
            {...register("valid_from")}
          />
          {errors.valid_from && (
            <span className="text-sm text-destructive">{errors.valid_from.message}</span>
          )}
        </div>
      )}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">{mode === "create" ? "Create Employee" : "Save Changes"}</Button>
      </div>
    </form>
  );
}
