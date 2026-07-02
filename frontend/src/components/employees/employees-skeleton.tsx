import { TableSkeleton } from "@/components/employees/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function EmployeesSkeleton() {
  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      <div className="flex-1 min-h-0 h-full w-full bg-background overflow-hidden flex">
        <div className="flex-1 transition-all duration-300 ease-in-out min-w-0">
          <div className="h-full overflow-y-auto min-w-0 bg-background">
            <div className="flex flex-col gap-6 p-8 pt-6 pr-4 h-full overflow-x-auto">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-full max-w-sm" />
                <Skeleton className="h-8 w-[180px]" />
                <Skeleton className="h-8 w-[180px]" />
                <div className="flex-1" />
                <Skeleton className="h-8 w-[140px]" />
              </div>

              <TableSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
