"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  total: number;
}

export function Pagination({ total }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const offset = Number(searchParams.get("offset") || "0");
  const limit = Number(searchParams.get("limit") || "20");

  const hasPrevious = offset > 0;
  const hasNext = offset + limit < total;

  const handleNavigate = (newOffset: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("offset", newOffset.toString());
    params.set("limit", limit.toString());
    NProgress.start();
    router.replace(`${pathname}?${params.toString()}` as Route);
  };

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {Math.floor(offset / limit) + 1} of {Math.max(1, Math.ceil(total / limit))}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => handleNavigate(Math.max(0, offset - limit))}
          disabled={!hasPrevious}
          aria-label="Previous page"
        >
          <span className="sr-only">Previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => handleNavigate(offset + limit)}
          disabled={!hasNext}
          aria-label="Next page"
        >
          <span className="sr-only">Next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
