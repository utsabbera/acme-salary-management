import { formatCurrency } from "@/lib/utils/currency";

export function SalaryBreakdown({
  item,
}: {
  item: {
    base_salary_minor_units: number;
    housing_allowance_minor_units?: number | null;
    equity_minor_units?: number | null;
    other_allowance_minor_units?: number | null;
    currency: string | { code: string };
  };
}) {
  if (!item) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm border-t pt-4">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Base Salary</span>
        <span className="font-medium text-foreground">
          {formatCurrency(
            item.base_salary_minor_units,
            typeof item.currency === "string" ? item.currency : item.currency.code,
          )}
        </span>
      </div>
      {item.housing_allowance_minor_units ? (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Housing</span>
          <span className="font-medium text-foreground">
            {formatCurrency(
              item.housing_allowance_minor_units,
              typeof item.currency === "string" ? item.currency : item.currency.code,
            )}
          </span>
        </div>
      ) : null}
      {item.equity_minor_units ? (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Equity</span>
          <span className="font-medium text-foreground">
            {formatCurrency(
              item.equity_minor_units,
              typeof item.currency === "string" ? item.currency : item.currency.code,
            )}
          </span>
        </div>
      ) : null}
      {item.other_allowance_minor_units ? (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Other</span>
          <span className="font-medium text-foreground">
            {formatCurrency(
              item.other_allowance_minor_units,
              typeof item.currency === "string" ? item.currency : item.currency.code,
            )}
          </span>
        </div>
      ) : null}
    </div>
  );
}
