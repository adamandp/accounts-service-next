import { DashboardPageGuard } from "@/components/layout/dashboard-page-guard";
import { UsersList } from "@/components/users/users-list";
export default function Page() {
  return (
    <DashboardPageGuard permission="user.read">
      <UsersList />
    </DashboardPageGuard>
  );
}
