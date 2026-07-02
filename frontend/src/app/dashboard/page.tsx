import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col p-8 pt-6 gap-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats />
      </Suspense>
    </div>
  );
}
