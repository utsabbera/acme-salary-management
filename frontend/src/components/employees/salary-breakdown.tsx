"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils/currency";

export function SalaryBreakdown({
  item,
  isUsd,
  exchangeRate,
}: {
  item: {
    base_salary_minor_units: number;
    housing_allowance_minor_units?: number | null;
    equity_minor_units?: number | null;
    other_allowance_minor_units?: number | null;
    currency: string | { code: string };
  };
  isUsd?: boolean;
  exchangeRate?: number;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!item) return null;

  const renderValue = (minor_units: number) => {
    if (isUsd) {
      if (!exchangeRate) {
        return (
          <Tooltip>
            <TooltipTrigger className="cursor-help decoration-dotted underline underline-offset-4 text-muted-foreground">
              ≈ USD N/A
            </TooltipTrigger>
            <TooltipContent>Exchange rate unavailable</TooltipContent>
          </Tooltip>
        );
      }
      return formatCurrency(minor_units * exchangeRate, "USD");
    }
    return formatCurrency(
      minor_units,
      typeof item.currency === "string" ? item.currency : item.currency.code,
    );
  };

  return (
    <div className="mt-2 pt-3 border-t border-border/40">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        {isOpen ? "Hide Breakdown" : "View Breakdown"}
      </button>

      {isOpen && (
        <div className="grid auto-cols-fr grid-flow-col mt-4 text-sm text-muted-foreground divide-x divide-border/60">
          <div className="flex flex-col gap-1 px-3 first:pl-0">
            <span className="text-xs uppercase tracking-wider font-semibold">Base Salary</span>
            <span className="font-mono tracking-tight font-medium text-foreground truncate">
              {renderValue(item.base_salary_minor_units)}
            </span>
          </div>
          {item.housing_allowance_minor_units ? (
            <div className="flex flex-col gap-1 px-3">
              <span className="text-xs uppercase tracking-wider font-semibold">Housing</span>
              <span className="font-mono tracking-tight font-medium text-foreground truncate">
                {renderValue(item.housing_allowance_minor_units)}
              </span>
            </div>
          ) : null}
          {item.equity_minor_units ? (
            <div className="flex flex-col gap-1 px-3">
              <span className="text-xs uppercase tracking-wider font-semibold">Equity</span>
              <span className="font-mono tracking-tight font-medium text-foreground truncate">
                {renderValue(item.equity_minor_units)}
              </span>
            </div>
          ) : null}
          {item.other_allowance_minor_units ? (
            <div className="flex flex-col gap-1 px-3">
              <span className="text-xs uppercase tracking-wider font-semibold">Other</span>
              <span className="font-mono tracking-tight font-medium text-foreground truncate">
                {renderValue(item.other_allowance_minor_units)}
              </span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
