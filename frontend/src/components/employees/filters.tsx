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

const DEPARTMENTS = [
  { id: "1", name: "Engineering" },
  { id: "2", name: "Sales" },
  { id: "3", name: "Marketing" },
  { id: "4", name: "HR" },
];
const COUNTRIES = [
  { id: "1", name: "United States" },
  { id: "2", name: "United Kingdom" },
  { id: "3", name: "Canada" },
];

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [departmentId, setDepartmentId] = useState(searchParams.get("department_id") || "ALL");
  const [countryId, setCountryId] = useState(searchParams.get("country_id") || "ALL");

  useEffect(() => {
    setDepartmentId(searchParams.get("department_id") || "ALL");
    setCountryId(searchParams.get("country_id") || "ALL");
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
    setCountryId(value || "ALL");
    const params = new URLSearchParams(searchParams);
    if (!value || value === "ALL") {
      params.delete("country_id");
    } else {
      params.set("country_id", value);
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
              : DEPARTMENTS.find((d) => d.id === departmentId)?.name || departmentId}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Departments</SelectItem>
          {DEPARTMENTS.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={countryId} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[180px]" aria-label="Country">
          <SelectValue placeholder="Country">
            {countryId === "ALL"
              ? "All Countries"
              : COUNTRIES.find((c) => c.id === countryId)?.name || countryId}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Countries</SelectItem>
          {COUNTRIES.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
