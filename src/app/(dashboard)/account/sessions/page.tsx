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
import { Laptop, Smartphone, Tablet, MonitorSmartphone } from "lucide-react";
import { sessionDevice } from "@/utils/session-device";
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
            {[...(q.data ?? [])]
              .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent))
              .map((s) => {
                const device = sessionDevice(s.userAgent);
                const DeviceIcon =
                  device.kind === "desktop"
                    ? Laptop
                    : device.kind === "mobile"
                      ? Smartphone
                      : device.kind === "tablet"
                        ? Tablet
                        : MonitorSmartphone;
                return (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <DeviceIcon className="size-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 space-y-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{device.name}</p>
                            {s.isCurrent && (
                              <Badge
                                variant="secondary"
                                className="gap-1 text-emerald-600 dark:text-emerald-400"
                              >
                                <span className="size-1.5 rounded-full bg-current" />
                                This device
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {device.browser ?? "Browser unavailable"}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last active: {date(s.lastUsedAt)}
                        </p>
                        <details className="text-xs text-muted-foreground">
                          <summary className="w-fit cursor-pointer hover:text-foreground">
                            Session details
                          </summary>
                          <div className="mt-2 space-y-1">
                            <p>Signed in: {date(s.createdAt)}</p>
                            <p>Expires: {date(s.expiresAt)}</p>
                            <p className="break-all font-mono">ID: {s.id}</p>
                          </div>
                        </details>
                      </div>
                    </div>
                    {!s.isCurrent && (
                      <ConfirmAction
                        label="Revoke"
                        title="Revoke this session?"
                        description="The session will lose access to your account."
                        onConfirm={async () => {
                          await api("/sessions/" + s.id, "DELETE");
                          await qc.invalidateQueries({
                            queryKey: ["sessions"],
                          });
                        }}
                      />
                    )}
                  </div>
                );
              })}
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
