import { Suspense } from "react";
import { CreateEmployeeDialog } from "@/components/employees/create-employee-dialog";
import { EmployeeProfilePane } from "@/components/employees/employee-profile-pane";
import { EmployeesTable } from "@/components/employees/employees-table";
import { Filters } from "@/components/employees/filters";
import { Pagination } from "@/components/employees/pagination";
import { SearchInput } from "@/components/employees/search-input";
import { TableSkeleton } from "@/components/employees/table-skeleton";
import { ServerWakeupLoader } from "@/components/layout/server-wakeup-loader";
import { SidePeekLayout } from "@/components/layout/side-peek-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import {
  type CountryRead,
  type CurrencyRead,
  type DepartmentRead,
  type ExchangeRateRead,
  getCountriesCountriesGet,
  getCurrenciesCurrenciesGet,
  getDepartmentsDepartmentsGet,
  getEmployeeEmployeesEmployeeIdGet,
  getExchangeRatesExchangeRatesGet,
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
  const employeeId =
    typeof params.employeeId === "string" ? parseInt(params.employeeId, 10) : undefined;

  const [departmentsRes, countriesRes, currenciesRes, exchangeRatesRes] = await Promise.all([
    getDepartmentsDepartmentsGet({ client: apiClient }),
    getCountriesCountriesGet({ client: apiClient }),
    getCurrenciesCurrenciesGet({ client: apiClient }),
    getExchangeRatesExchangeRatesGet({ client: apiClient }),
  ]);

  const departments = departmentsRes.data ?? [];
  const countries = countriesRes.data ?? [];
  const currencies = currenciesRes.data ?? [];
  const exchangeRates = exchangeRatesRes.data ?? [];

  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      <SidePeekLayout
        list={
          <div className="flex flex-col h-full p-8 pt-6 pr-4 pb-4">
            <div className="flex-1 min-h-0 flex flex-col">
              <Suspense fallback={<TableSkeleton />}>
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
          </div>
        }
        detail={
          employeeId && !Number.isNaN(employeeId) ? (
            <Suspense
              fallback={
                <ServerWakeupLoader>
                  <div className="flex flex-col h-full p-6 gap-6 w-full">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="flex-1 w-full rounded-xl" />
                  </div>
                </ServerWakeupLoader>
              }
            >
              <EmployeeProfileServerPane
                id={employeeId}
                departments={departments}
                countries={countries}
                currencies={currencies}
                exchangeRates={exchangeRates}
                search={search}
                department_id={!Number.isNaN(department_id) ? department_id : undefined}
                country_code={country_code}
                offset={offset}
                limit={limit}
              />
            </Suspense>
          ) : null
        }
      />
    </div>
  );
}

async function EmployeeProfileServerPane({
  id,
  departments,
  countries,
  currencies,
  exchangeRates,
  search,
  department_id,
  country_code,
  offset,
  limit,
}: {
  id: number;
  departments: DepartmentRead[];
  countries: CountryRead[];
  currencies: CurrencyRead[];
  exchangeRates: ExchangeRateRead[];
  search?: string;
  department_id?: number;
  country_code?: string;
  offset: number;
  limit: number;
}) {
  const [{ data }, { data: listData }] = await Promise.all([
    getEmployeeEmployeesEmployeeIdGet({
      client: apiClient,
      path: { employee_id: id },
    }),
    listEmployeesEmployeesGet({
      client: apiClient,
      query: {
        search,
        department_id,
        country_code,
        offset: Math.max(0, offset - 1),
        limit: offset > 0 ? limit + 2 : limit + 1,
      },
    }),
  ]);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-muted-foreground">
        Employee not found.
      </div>
    );
  }

  let prevId: number | null = null;
  let nextId: number | null = null;
  let prevOffset: number | null = null;
  let nextOffset: number | null = null;

  if (listData?.items) {
    const currentIndex = listData.items.findIndex((item) => item.id === id);
    if (currentIndex !== -1) {
      if (currentIndex > 0) {
        prevId = listData.items[currentIndex - 1]?.id ?? null;
        if (offset > 0 && currentIndex === 1) {
          prevOffset = Math.max(0, offset - limit);
        }
      }

      if (currentIndex < listData.items.length - 1) {
        nextId = listData.items[currentIndex + 1]?.id ?? null;
        const offsetInFetchedArray = offset > 0 ? 1 : 0;
        const isNextItemOnNextPage = currentIndex >= offsetInFetchedArray + limit - 1;
        if (isNextItemOnNextPage) {
          nextOffset = offset + limit;
        }
      }
    }
  }

  return (
    <EmployeeProfilePane
      key={data.id}
      employee={data}
      departments={departments}
      countries={countries}
      currencies={currencies}
      exchangeRates={exchangeRates}
      prevId={prevId}
      nextId={nextId}
      prevOffset={prevOffset}
      nextOffset={nextOffset}
    />
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
    <div className="flex flex-col h-full min-h-0 w-full">
      <div className="flex flex-col gap-4 h-full min-h-0">
        <div className="flex items-center gap-4 mb-2 shrink-0">
          <SearchInput />
          <Filters departments={departments} countries={countries} />
          <div className="flex-1" />
          <CreateEmployeeDialog departments={departments} countries={countries} />
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <EmployeesTable employees={employees} departments={departments} countries={countries} />
        </div>
        <Pagination total={total} />
      </div>
    </div>
  );
}
