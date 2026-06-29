"use client";

import { LayoutDashboardIcon, UsersIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/20 hidden md:block h-full overflow-y-auto">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href={"/dashboard" as Route} className="flex items-center gap-2 font-semibold">
          <span className="text-lg">ACME Salary</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
          <Link
            href={"/dashboard" as Route}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname?.startsWith("/dashboard")
                ? "bg-muted text-primary"
                : "text-muted-foreground",
            )}
          >
            <LayoutDashboardIcon className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href={"/employees" as Route}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname?.startsWith("/employees")
                ? "bg-muted text-primary"
                : "text-muted-foreground",
            )}
          >
            <UsersIcon className="h-4 w-4" />
            Employees
          </Link>
        </nav>
      </div>
    </aside>
  );
}
