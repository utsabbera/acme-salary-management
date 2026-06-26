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

const DEPARTMENTS = ["Engineering", "HR", "Sales", "Marketing", "Finance"];
const COUNTRIES = ["USD", "EUR", "GBP", "INR", "CAD"];

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [department, setDepartment] = useState(searchParams.get("department") || "ALL");
  const [country, setCountry] = useState(searchParams.get("country") || "ALL");

  useEffect(() => {
    setDepartment(searchParams.get("department") || "ALL");
    setCountry(searchParams.get("country") || "ALL");
  }, [searchParams]);

  const handleDepartmentChange = (value: string | null) => {
    setDepartment(value || "ALL");
    const params = new URLSearchParams(searchParams);
    if (!value || value === "ALL") {
      params.delete("department");
    } else {
      params.set("department", value);
    }
    params.set("offset", "0");
    router.replace(`${pathname}?${params.toString()}` as Route);
  };

  const handleCountryChange = (value: string | null) => {
    setCountry(value || "ALL");
    const params = new URLSearchParams(searchParams);
    if (!value || value === "ALL") {
      params.delete("country");
    } else {
      params.set("country", value);
    }
    params.set("offset", "0");
    router.replace(`${pathname}?${params.toString()}` as Route);
  };

  return (
    <div className="flex gap-4">
      <Select value={department} onValueChange={handleDepartmentChange}>
        <SelectTrigger className="w-[180px]" aria-label="Department">
          <SelectValue placeholder="Department">
            {department === "ALL" ? "All Departments" : department}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Departments</SelectItem>
          {DEPARTMENTS.map((dept) => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={country} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[180px]" aria-label="Country">
          <SelectValue placeholder="Country">
            {country === "ALL" ? "All Countries" : country}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Countries</SelectItem>
          {COUNTRIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
