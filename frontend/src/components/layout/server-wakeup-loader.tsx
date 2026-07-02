"use client";

import { ServerCog, WifiHigh } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ServerWakeupLoader({ children }: { children?: React.ReactNode }) {
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    // If the component is still mounted after 3 seconds,
    // we assume the server is waking up.
    const timer = setTimeout(() => {
      setIsWakingUp(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-full w-full relative">
      <div
        className={cn(
          "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 text-center bg-background/90 backdrop-blur-md transition-all duration-1000",
          isWakingUp
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        <div className="relative">
          {/* Outer pulsing ring */}
          <div
            className="absolute -inset-4 rounded-full bg-primary/20 animate-ping"
            style={{ animationDuration: "3s" }}
          />
          {/* Inner glowing circle */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 backdrop-blur-sm">
            <ServerCog className="h-10 w-10 text-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-2 mt-4 max-w-sm">
          <h3 className="text-xl font-semibold tracking-tight">Waking up the server...</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We're using a free tier for our backend. It usually takes about{" "}
            <span className="font-medium text-foreground">50 seconds</span> to spin up after a
            period of inactivity.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 bg-muted/50 px-3 py-1.5 rounded-full">
          <WifiHigh className="h-3 w-3 animate-pulse" />
          <span>Establishing connection</span>
        </div>
      </div>

      {/* The generic loader shown for the first 3 seconds */}
      <div
        className={cn(
          "flex flex-col gap-6 w-full transition-all duration-500",
          !children && "max-w-4xl px-8 mx-auto",
          !isWakingUp
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none",
        )}
      >
        {children ? (
          children
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-48" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <Card className="p-0 border-none shadow-none bg-transparent">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
