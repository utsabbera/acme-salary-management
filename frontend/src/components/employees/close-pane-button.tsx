"use client";

import { ChevronsRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import { Button } from "@/components/ui/button";

export function ClosePaneButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topLoader = useTopLoader();

  const handleClose = () => {
    topLoader.start();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("employeeId");
    router.push(`?${params.toString()}` as never);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClose}
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
      aria-label="Close pane"
    >
      <ChevronsRight className="h-4 w-4" />
    </Button>
  );
}
