import { TableSkeleton } from "@/components/employees/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeesLoading() {
  return (
    <div className="flex-1 flex flex-col relative h-full min-h-0 bg-background">
      <div className="flex-1 min-h-0 h-full w-full bg-background overflow-hidden flex">
        <div className="flex-1 transition-all duration-300 ease-in-out min-w-0">
          <div className="h-full overflow-y-auto min-w-0 bg-background">
            <div className="flex flex-col gap-6 p-8 pt-6 pr-4 h-full overflow-x-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
              </div>

              {/* Filters and Actions Skeleton */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-[300px]" />
                <Skeleton className="h-10 w-[150px]" />
                <Skeleton className="h-10 w-[150px]" />
                <div className="flex-1" />
                <Skeleton className="h-10 w-[180px]" />
              </div>

              <div className="mt-4">
                <TableSkeleton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
