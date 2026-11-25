"use client";
import { DashboardPageGuard } from "@/components/layout/dashboard-page-guard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/services/api";
import { PasswordForm } from "@/components/account/password-form";
import { PageHeading } from "@/components/layout/page-heading";
import { ConfirmAction } from "@/components/layout/confirm-action";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
function SecurityContent() {
  const auth = useAuth(),
    router = useRouter();
  return (
    <>
      <PageHeading
        title="Password & security"
        description="Manage account security and sensitive actions."
      />
      <PasswordForm />
      <Card>
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            Permanently request deletion of your account and revoke sessions.
            Protected accounts may not be deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmAction
            label="Delete my account"
            title="Delete your account?"
            description="This will remove your access and cannot be undone through this interface."
            onConfirm={async () => {
              await api("/users/me", "DELETE");
              auth.clear();
              router.replace("/login");
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}

export default function Security() {
  return (
    <DashboardPageGuard>
      <SecurityContent />
    </DashboardPageGuard>
  );
}
