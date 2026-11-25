import { Suspense } from "react";
import { DashboardPageGuard } from "@/components/layout/dashboard-page-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceDetail } from "@/components/rbac/resource-detail";

type PageProps = { params: Promise<{ id: string }> };

async function Detail({ params }: PageProps) {
  const { id } = await params;
  return <ResourceDetail kind="permissions" id={id} />;
}

export default function Page({ params }: PageProps) {
  return (
    <DashboardPageGuard permission="permission.read">
      <Suspense
        fallback={
          <div className="space-y-3" role="status" aria-label="Loading details">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        }
      >
        <Detail params={params} />
      </Suspense>
    </DashboardPageGuard>
  );
}
