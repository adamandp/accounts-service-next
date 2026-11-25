import { DashboardPageGuard } from "@/components/layout/dashboard-page-guard";
import { ResourcesList } from "@/components/rbac/resources-list";
export default function Page() {
  return (
    <DashboardPageGuard permission="permission.read">
      <ResourcesList kind="permissions" />
    </DashboardPageGuard>
  );
}
