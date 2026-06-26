import { Suspense } from "react";
import { EmployeesTable } from "@/components/employees/employees-table";
import { Filters } from "@/components/employees/filters";
import { Pagination } from "@/components/employees/pagination";
import { SearchInput } from "@/components/employees/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { listEmployeesEmployeesGet } from "@/lib/generated";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EmployeesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : undefined;
  const department = typeof params.department === "string" ? params.department : undefined;
  const country = typeof params.country === "string" ? params.country : undefined;
  const offset = typeof params.offset === "string" ? parseInt(params.offset, 10) : 0;
  const limit = typeof params.limit === "string" ? parseInt(params.limit, 10) : 20;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchInput />
        <Filters />
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <EmployeeData
          search={search}
          department={department}
          country={country}
          offset={offset}
          limit={limit}
        />
      </Suspense>
    </div>
  );
}

async function EmployeeData({
  search,
  department,
  country,
  offset,
  limit,
}: {
  search?: string;
  department?: string;
  country?: string;
  offset: number;
  limit: number;
}) {
  const { data, error } = await listEmployeesEmployeesGet({
    client: apiClient,
    query: {
      search,
      department,
      country,
      offset,
      limit,
    },
  });

  if (error) {
    return (
      <div className="rounded-md border p-8 text-center text-destructive">
        Failed to load employees. Please try again later.
      </div>
    );
  }

  const employees = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="flex flex-col gap-4">
      <EmployeesTable employees={employees} />
      <Pagination total={total} />
    </div>
  );
}

const SKELETON_HEADERS = ["h1", "h2", "h3", "h4", "h5", "h6"];
const SKELETON_ROWS = ["r1", "r2", "r3", "r4", "r5"];
const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6"];

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border">
        <div className="border-b p-4">
          <div className="flex gap-4">
            {SKELETON_HEADERS.map((key) => (
              <Skeleton key={key} className="h-6 w-full" />
            ))}
          </div>
        </div>
        <div>
          {SKELETON_ROWS.map((rowKey) => (
            <div key={rowKey} className="flex gap-4 border-b p-4 last:border-0">
              {SKELETON_COLS.map((colKey) => (
                <Skeleton key={`${rowKey}-${colKey}`} className="h-6 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-2">
        <Skeleton className="h-4 w-[100px]" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
