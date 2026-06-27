"use client";

import { useSearchParams } from "next/navigation";
import type * as React from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export function SidePeekLayout({
  list,
  detail,
}: {
  list: React.ReactNode;
  detail: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId");

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="min-h-[calc(100vh-theme(spacing.16))] w-full bg-background overflow-hidden flex"
    >
      <ResizablePanel
        defaultSize={employeeId ? 60 : 100}
        minSize={40}
        className="transition-all duration-300 ease-in-out min-w-0"
      >
        <div className="h-full overflow-y-auto min-w-0 bg-background" data-testid="list-pane">
          {list}
        </div>
      </ResizablePanel>

      {employeeId && (
        <>
          <ResizableHandle className="w-1.5 bg-border/50 hover:bg-border active:bg-border transition-colors z-30" />

          <ResizablePanel
            defaultSize={40}
            minSize={25}
            className="transition-all duration-300 ease-in-out min-w-0 border-l"
          >
            <div className="h-full bg-muted/10 min-w-0" data-testid="detail-pane">
              {detail}
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
