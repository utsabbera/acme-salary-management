import { ServerWakeupLoader } from "@/components/layout/server-wakeup-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <ServerWakeupLoader>
      <div className="flex flex-col gap-8 w-full">
        {/* Top Stats Cards */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
              {/* Total Employees */}
              <div className="flex flex-col p-6 justify-center">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
                <Skeleton className="h-9 w-20 mt-2" />
                <Skeleton className="h-3 w-32 mt-2" />
              </div>

              {/* Global Avg CTC */}
              <div className="flex flex-col p-6 justify-center">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
                <Skeleton className="h-9 w-32 mt-2" />
                <Skeleton className="h-3 w-36 mt-2" />
              </div>

              {/* Total Annual Payroll */}
              <div className="flex flex-col p-6 justify-center bg-muted/20">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
                <Skeleton className="h-9 w-40 mt-2" />
                <Skeleton className="h-3 w-32 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-48" />
              </CardTitle>
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-40" />
              </CardTitle>
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-52" />
              </CardTitle>
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-square max-h-[350px] mx-auto w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-44" />
              </CardTitle>
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </ServerWakeupLoader>
  );
}
