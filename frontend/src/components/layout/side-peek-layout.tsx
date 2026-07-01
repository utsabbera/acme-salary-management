"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";
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
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex flex-1 min-h-0 h-full w-full bg-background overflow-hidden">
        <div
          className="h-full overflow-y-auto min-w-0 bg-background"
          style={{ flex: employeeId ? "0 0 60%" : "1 1 0%" }}
          data-testid="list-pane"
        >
          {list}
        </div>
        {employeeId && (
          <>
            <div className="w-1.5 bg-border/50 shrink-0" />
            <div
              className="h-full bg-muted/10 min-w-0 border-l overflow-y-auto"
              style={{ flex: "0 0 40%" }}
              data-testid="detail-pane"
            >
              {detail}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="flex-1 min-h-0 h-full w-full bg-background overflow-hidden flex"
    >
      <ResizablePanel defaultSize={employeeId ? 60 : 100} minSize={40} className="min-w-0">
        <div className="h-full overflow-y-auto min-w-0 bg-background" data-testid="list-pane">
          {list}
        </div>
      </ResizablePanel>

      {employeeId && (
        <>
          <ResizableHandle className="w-1.5 bg-border/50 hover:bg-border active:bg-border transition-colors z-30" />
          <ResizablePanel defaultSize={40} minSize={25} className="min-w-0 border-l">
            <div className="h-full bg-muted/10 min-w-0" data-testid="detail-pane">
              {detail}
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
