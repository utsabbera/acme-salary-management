import { DownloadIcon } from "lucide-react";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col p-8 pt-6 gap-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time compensation and payroll distribution metrics.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats />
      </Suspense>
    </div>
  );
}
