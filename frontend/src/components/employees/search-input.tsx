"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (value === currentSearch) {
      return;
    }

    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      params.delete("offset");
      params.delete("employeeId");

      const newQueryString = params.toString();
      if (newQueryString !== searchParams.toString()) {
        NProgress.start();
        router.replace(`${pathname}${newQueryString ? `?${newQueryString}` : ""}` as Route);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [value, router, pathname, searchParams]);

  useEffect(() => {
    setValue(searchParams.get("search") || "");
  }, [searchParams]);

  return (
    <Input
      type="text"
      placeholder="Search employees..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="max-w-sm"
    />
  );
}
