import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col p-8 pt-6 gap-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time compensation and payroll distribution metrics.
          </p>
        </div>
      </div>

      <DashboardSkeleton />
    </div>
  );
}
