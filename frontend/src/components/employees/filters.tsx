"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CountryRead, DepartmentRead } from "@/lib/generated";

interface FiltersProps {
  departments: DepartmentRead[];
  countries: CountryRead[];
}

export function Filters({ departments, countries }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [departmentId, setDepartmentId] = useState(searchParams.get("department_id") || "ALL");
  const [countryCode, setCountryCode] = useState(searchParams.get("country_code") || "ALL");

  useEffect(() => {
    setDepartmentId(searchParams.get("department_id") || "ALL");
    setCountryCode(searchParams.get("country_code") || "ALL");
  }, [searchParams]);

  const handleDepartmentChange = (value: string | null) => {
    setDepartmentId(value || "ALL");
    const params = new URLSearchParams(searchParams);
    if (!value || value === "ALL") {
      params.delete("department_id");
    } else {
      params.set("department_id", value);
    }
    params.set("offset", "0");
    router.replace(`${pathname}?${params.toString()}` as Route);
  };

  const handleCountryChange = (value: string | null) => {
    setCountryCode(value || "ALL");
    const params = new URLSearchParams(searchParams);
    if (!value || value === "ALL") {
      params.delete("country_code");
    } else {
      params.set("country_code", value);
    }
    params.set("offset", "0");
    router.replace(`${pathname}?${params.toString()}` as Route);
  };

  return (
    <div className="flex gap-4">
      <Select value={departmentId} onValueChange={handleDepartmentChange}>
        <SelectTrigger className="w-[180px]" aria-label="Department">
          <SelectValue placeholder="Department">
            {departmentId === "ALL"
              ? "All Departments"
              : departments.find((d) => String(d.id) === departmentId)?.name || departmentId}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Departments</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={String(dept.id)}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={countryCode} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[180px]" aria-label="Country">
          <SelectValue placeholder="Country">
            {countryCode === "ALL"
              ? "All Countries"
              : countries.find((c) => c.code === countryCode)?.name || countryCode}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Countries</SelectItem>
          {countries.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
