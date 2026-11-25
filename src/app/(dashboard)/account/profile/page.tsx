import { DashboardPageGuard } from "@/components/layout/dashboard-page-guard";
import { Profile } from "@/components/account/profile";
export default function Page() {
  return (
    <DashboardPageGuard>
      <Profile />
    </DashboardPageGuard>
  );
}
