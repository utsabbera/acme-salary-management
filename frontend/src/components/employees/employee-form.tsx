"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod/v3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CountryRead, DepartmentRead } from "@/lib/generated";

const employeeSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  department_id: z.number().min(1, "Department is required"),
  country_code: z.string().min(1, "Country is required"),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => void;
  mode: "create" | "edit";
  defaultValues?: Partial<EmployeeFormData>;
  departments: DepartmentRead[];
  countries: CountryRead[];
}

export function EmployeeForm({
  onSubmit,
  mode,
  defaultValues,
  departments,
  countries,
}: EmployeeFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" {...register("first_name")} />
          {errors.first_name && (
            <span className="text-sm text-destructive">{errors.first_name.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" {...register("last_name")} />
          {errors.last_name && (
            <span className="text-sm text-destructive">{errors.last_name.message}</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <span className="text-sm text-destructive">{errors.email.message}</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department_id">Department</Label>
          <Controller
            name="department_id"
            control={control}
            render={({ field }) => {
              const selectedDepartment = departments.find((d) => d.id === Number(field.value));
              return (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger id="department_id" aria-label="Department">
                    <SelectValue placeholder="Select department">
                      {selectedDepartment ? selectedDepartment.name : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={String(dept.id)}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }}
          />
          {errors.department_id && (
            <span className="text-sm text-destructive">{errors.department_id.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country_code">Country</Label>
          <Controller
            name="country_code"
            control={control}
            render={({ field }) => {
              const selectedCountry = countries.find((c) => c.code === field.value);
              return (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="country_code" aria-label="Country">
                    <SelectValue placeholder="Select country">
                      {selectedCountry ? selectedCountry.name : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }}
          />
          {errors.country_code && (
            <span className="text-sm text-destructive">{errors.country_code.message}</span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">{mode === "create" ? "Create Employee" : "Save Changes"}</Button>
      </div>
    </form>
  );
}
