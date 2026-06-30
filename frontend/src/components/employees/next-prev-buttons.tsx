"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface NextPrevButtonsProps {
  prevId: number | null;
  nextId: number | null;
  prevOffset: number | null;
  nextOffset: number | null;
}

export function NextPrevButtons({ prevId, nextId, prevOffset, nextOffset }: NextPrevButtonsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigate = (id: number | null, newOffset: number | null) => {
    if (id === null) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("employeeId", id.toString());

    if (newOffset !== null) {
      params.set("offset", newOffset.toString());
    }

    router.push(`?${params.toString()}` as never);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        disabled={prevId === null}
        onClick={() => handleNavigate(prevId, prevOffset)}
        aria-label="Previous employee"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        disabled={nextId === null}
        onClick={() => handleNavigate(nextId, nextOffset)}
        aria-label="Next employee"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
