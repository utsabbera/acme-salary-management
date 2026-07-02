"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AskAiButton() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div className="relative inline-flex h-8 items-center justify-center rounded-full p-[0.25px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-[length:200%_auto] group transition-all duration-500 cursor-pointer hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] hover:bg-[position:right_center] hover:scale-105">
            <Button
              variant="ghost"
              className="h-full w-full gap-1.5 rounded-full bg-background px-3 text-muted-foreground hover:text-foreground hover:bg-background transition-all duration-300"
            >
              <Sparkles className="size-3.5 text-violet-500 transition-all duration-500 group-hover:scale-125 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:fill-violet-500/20" />
              <span className="text-xs font-medium">Ask AI</span>
            </Button>
          </div>
        }
      />
      <TooltipContent side="bottom" align="center" className="text-xs">
        <p>Coming soon!</p>
      </TooltipContent>
    </Tooltip>
  );
}
