import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col p-8 pt-6 gap-8">
      <DashboardSkeleton />
    </div>
  );
}
