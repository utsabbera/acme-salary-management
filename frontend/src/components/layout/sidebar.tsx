"use client";

import { GalleryVerticalEnd, LayoutDashboardIcon, Sparkles, UsersIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/20 hidden md:flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href={"/dashboard" as Route} className="flex items-center gap-2 font-semibold">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <span className="text-lg tracking-tight">Acme Salary</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4 gap-1">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Overview
          </div>
          <Link
            href={"/dashboard" as Route}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 transition-all hover:text-primary",
              pathname?.startsWith("/dashboard")
                ? "bg-muted text-primary font-medium"
                : "text-muted-foreground",
            )}
          >
            <LayoutDashboardIcon className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href={"/employees" as Route}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 transition-all hover:text-primary",
              pathname?.startsWith("/employees")
                ? "bg-muted text-primary font-medium"
                : "text-muted-foreground",
            )}
          >
            <UsersIcon className="h-4 w-4" />
            Employees
          </Link>

          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6">
            Intelligence
          </div>
          <div
            className="flex items-center justify-between gap-3 rounded-md px-3 py-2 transition-all text-muted-foreground bg-primary/5 border border-primary/10 cursor-not-allowed select-none"
            title="Ask AI is coming soon!"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Ask AI</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded-sm">
              Soon
            </span>
          </div>
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-medium leading-none">Jane Doe</span>
            <span className="text-xs text-muted-foreground mt-1">HR Admin</span>
          </div>
          <div className="rounded-md bg-muted/50">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
