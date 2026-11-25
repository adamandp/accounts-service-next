import { Suspense } from "react";
import { DashboardPageGuard } from "@/components/layout/dashboard-page-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDetail } from "@/components/users/user-detail";

type PageProps = { params: Promise<{ id: string }> };

async function Detail({ params }: PageProps) {
  const { id } = await params;
  return <UserDetail id={id} />;
}

export default function Page({ params }: PageProps) {
  return (
    <DashboardPageGuard permission="user.read">
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
