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
  department_id: z.coerce.number().min(1, "Department ID is required"),
  country_id: z.coerce.number().min(1, "Country ID is required"),
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
          <Label htmlFor="department_id">Department ID</Label>
          <Input
            id="department_id"
            type="number"
            defaultValue={defaultValues?.department_id}
            {...register("department_id")}
          />
          {errors.department_id && (
            <span className="text-sm text-destructive">{errors.department_id.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country_id">Country ID</Label>
          <Input
            id="country_id"
            type="number"
            defaultValue={defaultValues?.country_id}
            {...register("country_id")}
          />
          {errors.country_id && (
            <span className="text-sm text-destructive">{errors.country_id.message}</span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">{mode === "create" ? "Create Employee" : "Save Changes"}</Button>
      </div>
    </form>
  );
}
