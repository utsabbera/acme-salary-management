import { Suspense } from "react";
import { CreateEmployeeDialog } from "@/components/employees/create-employee-dialog";
import { EmployeeProfilePane } from "@/components/employees/employee-profile-pane";
import { EmployeesTable } from "@/components/employees/employees-table";
import { Filters } from "@/components/employees/filters";
import { Pagination } from "@/components/employees/pagination";
import { SearchInput } from "@/components/employees/search-input";
import { SidePeekLayout } from "@/components/layout/side-peek-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import {
  type CountryRead,
  type DepartmentRead,
  getCountriesCountriesGet,
  getCurrenciesCurrenciesGet,
  getDepartmentsDepartmentsGet,
  listEmployeesEmployeesGet,
} from "@/lib/generated";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EmployeesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : undefined;
  const department_id =
    typeof params.department_id === "string" ? parseInt(params.department_id, 10) : undefined;
  const country_code = typeof params.country_code === "string" ? params.country_code : undefined;
  const offset = typeof params.offset === "string" ? parseInt(params.offset, 10) : 0;
  const limit = typeof params.limit === "string" ? parseInt(params.limit, 10) : 20;

  const [departmentsRes, countriesRes, currenciesRes] = await Promise.all([
    getDepartmentsDepartmentsGet({ client: apiClient }),
    getCountriesCountriesGet({ client: apiClient }),
    getCurrenciesCurrenciesGet({ client: apiClient }),
  ]);

  const departments = departmentsRes.data ?? [];
  const countries = countriesRes.data ?? [];
  const currencies = currenciesRes.data ?? [];

  return (
    <div className="flex-1 flex flex-col p-8 pt-6 gap-6 relative h-full min-h-0">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
      </div>

      <SidePeekLayout
        list={
          <div className="flex flex-col gap-6 pr-4 min-w-0 h-full">
            <div className="flex items-center gap-4">
              <SearchInput />
              <Filters departments={departments} countries={countries} />
              <div className="flex-1" />
              <CreateEmployeeDialog
                departments={departments}
                countries={countries}
                trigger={<Button>Add Employee</Button>}
              />
            </div>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <EmployeeData
                search={search}
                department_id={!Number.isNaN(department_id) ? department_id : undefined}
                country_code={country_code}
                offset={offset}
                limit={limit}
                departments={departments}
                countries={countries}
              />
            </Suspense>
          </div>
        }
        detail={
          <Suspense fallback={null}>
            <EmployeeProfilePane
              departments={departments}
              countries={countries}
              currencies={currencies}
            />
          </Suspense>
        }
      />
    </div>
  );
}

async function EmployeeData({
  search,
  department_id,
  country_code,
  offset,
  limit,
  departments,
  countries,
}: {
  search?: string;
  department_id?: number;
  country_code?: string;
  offset: number;
  limit: number;
  departments: DepartmentRead[];
  countries: CountryRead[];
}) {
  const { data, error } = await listEmployeesEmployeesGet({
    client: apiClient,
    query: {
      search,
      department_id,
      country_code,
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
    <div className="flex flex-col gap-4 min-w-0 overflow-x-hidden">
      <EmployeesTable employees={employees} departments={departments} countries={countries} />
      <Pagination total={total} />
    </div>
  );
}
