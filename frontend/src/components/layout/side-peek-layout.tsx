"use client";

import * as React from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const CLOSE_DURATION_MS = 280;

function ClosingPane({
  children,
  initialWidth,
  onDone,
}: {
  children: React.ReactNode;
  initialWidth: number;
  onDone: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.width = `${initialWidth}px`;

    const frameId = requestAnimationFrame(() => {
      el.style.width = "0px";
    });

    const timer = setTimeout(onDone, CLOSE_DURATION_MS);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
    };
  }, [initialWidth, onDone]);

  return (
    <div
      ref={ref}
      className="h-full shrink-0 overflow-hidden border-l bg-muted/10"
      style={{ transition: `width ${CLOSE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.6, 1)` }}
      data-testid="detail-pane"
    >
      {children}
    </div>
  );
}

export function SidePeekLayout({
  list,
  detail,
}: {
  list: React.ReactNode;
  detail: React.ReactNode;
}) {
  const isOpen = !!detail;
  const [isMounted, setIsMounted] = React.useState(false);
  const [closingWidth, setClosingWidth] = React.useState<number | null>(null);
  const prevIsOpen = React.useRef(isOpen);
  const detailInnerRef = React.useRef<HTMLDivElement>(null);
  const prevDetail = React.useRef<React.ReactNode>(detail);
  const isEntering = React.useRef(false);

  if (isOpen && !prevIsOpen.current) {
    isEntering.current = true;
  } else if (!isOpen) {
    isEntering.current = false;
  }

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (prevIsOpen.current && !isOpen) {
      const width = detailInnerRef.current?.getBoundingClientRect().width ?? 400;
      setClosingWidth(width);
      prevIsOpen.current = false;
    } else {
      prevIsOpen.current = isOpen;
      if (isOpen) {
        prevDetail.current = detail;
      }
    }
  }, [isOpen, detail]);

  const handleClosingDone = React.useCallback(() => {
    setClosingWidth(null);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex flex-1 min-h-0 h-full w-full bg-background overflow-hidden">
        <div
          className="h-full overflow-y-auto min-w-0 bg-background"
          style={{ flex: isOpen ? "0 0 60%" : "1 1 0%" }}
          data-testid="list-pane"
        >
          {list}
        </div>
        {isOpen && (
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

  if (closingWidth !== null) {
    return (
      <div className="flex flex-1 min-h-0 h-full w-full bg-background overflow-hidden">
        <div
          className="h-full overflow-y-auto min-w-0 bg-background flex-1"
          data-testid="list-pane"
        >
          {list}
        </div>
        <ClosingPane initialWidth={closingWidth} onDone={handleClosingDone}>
          {prevDetail.current}
        </ClosingPane>
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="flex-1 min-h-0 h-full w-full bg-background overflow-hidden flex"
    >
      <ResizablePanel defaultSize={isOpen ? 60 : 100} minSize={40} className="min-w-0">
        <div className="h-full overflow-y-auto min-w-0 bg-background" data-testid="list-pane">
          {list}
        </div>
      </ResizablePanel>

      {isOpen && (
        <>
          <ResizableHandle className="w-1.5 bg-border/50 hover:bg-border active:bg-border transition-colors z-30" />
          <ResizablePanel
            defaultSize={40}
            minSize={25}
            className="min-w-0 border-l overflow-hidden"
          >
            <div
              ref={detailInnerRef}
              className={`h-full bg-muted/10 min-w-0 ${isEntering.current ? "sidepeek-enter" : ""}`}
              data-testid="detail-pane"
            >
              {detail}
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
