"use client";
import { DashboardPageGuard } from "@/components/layout/dashboard-page-guard";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/providers/auth-provider";
import { PageHeading } from "@/components/layout/page-heading";
import { QueryState } from "@/components/layout/query-state";
import { ConfirmAction } from "@/components/layout/confirm-action";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeyRound } from "lucide-react";
import type { Session } from "@/types/accounts";
import { date } from "@/utils/format";
function SessionsContent() {
  const auth = useAuth(),
    router = useRouter(),
    qc = useQueryClient();
  const q = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api<Session[]>("/sessions"),
  });
  return (
    <>
      <PageHeading
        title="Sessions"
        description="View active sessions and revoke access you no longer need."
      />
      <QueryState
        loading={q.isPending}
        error={q.error}
        retry={() => q.refetch()}
      >
        <Card>
          <CardHeader>
            <CardTitle>Active sessions</CardTitle>
            <CardDescription>
              {q.data?.length ?? 0} of 5 sessions in use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {q.data?.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <KeyRound className="mt-1 size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {s.isCurrent ? "Current session" : "Other session"}
                      </p>
                      {s.isCurrent && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <p className="break-all font-mono text-xs text-muted-foreground">
                      {s.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {date(s.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last used: {date(s.lastUsedAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires: {date(s.expiresAt)}
                    </p>
                  </div>
                </div>
                {!s.isCurrent && (
                  <ConfirmAction
                    label="Revoke"
                    title="Revoke this session?"
                    description="The session will lose access to your account."
                    onConfirm={async () => {
                      await api("/sessions/" + s.id, "DELETE");
                      await qc.invalidateQueries({ queryKey: ["sessions"] });
                    }}
                  />
                )}
              </div>
            ))}
            {!q.data?.length && (
              <p className="text-sm text-muted-foreground">
                No active sessions.
              </p>
            )}
          </CardContent>
        </Card>
      </QueryState>
      <Card>
        <CardHeader>
          <CardTitle>Sign out everywhere</CardTitle>
          <CardDescription>
            Revoke all sessions, including this browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmAction
            label="Sign out of all sessions"
            title="Sign out everywhere?"
            description="You will need to sign in again on every device."
            onConfirm={async () => {
              await auth.logout(true);
              router.replace("/login");
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}

export default function Sessions() {
  return (
    <DashboardPageGuard>
      <SessionsContent />
    </DashboardPageGuard>
  );
}
