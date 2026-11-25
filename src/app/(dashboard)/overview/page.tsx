"use client";
import { DashboardPageGuard } from "@/components/layout/dashboard-page-guard";
import { useQuery } from "@tanstack/react-query";
import { api, request } from "@/services/api";
import { useAuth } from "@/providers/auth-provider";
import type { UserPage, Role, Permission, Health } from "@/types/accounts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/layout/page-heading";
import { Users, Shield, KeyRound } from "lucide-react";
function HealthRow({ label, path }: { label: string; path: string }) {
  const q = useQuery({
    queryKey: ["health", path],
    queryFn: () => request<Health>(path),
    refetchInterval: 60_000,
  });
  return (
    <div className="flex items-center justify-between border-b py-3 last:border-0">
      <span>{label}</span>
      <Badge variant={q.isError ? "destructive" : "secondary"}>
        {q.isPending
          ? "Checking"
          : q.isError
            ? "Unavailable"
            : q.data?.status === "ok"
              ? "Operational"
              : "Check required"}
      </Badge>
    </div>
  );
}
function OverviewContent() {
  const auth = useAuth();
  const users = useQuery({
    queryKey: ["users", "count"],
    queryFn: () => api<UserPage>("/users?page=1&limit=1"),
    enabled: auth.has("user.read"),
  });
  const roles = useQuery({
    queryKey: ["roles"],
    queryFn: () => api<Role[]>("/roles"),
    enabled: auth.has("role.read"),
  });
  const permissions = useQuery({
    queryKey: ["permissions"],
    queryFn: () => api<Permission[]>("/permissions"),
    enabled: auth.has("permission.read"),
  });
  const metrics = [
    {
      label: "Total users",
      permission: "user.read",
      value: users.data?.total,
      query: users,
      icon: Users,
    },
    {
      label: "Total roles",
      permission: "role.read",
      value: roles.data?.length,
      query: roles,
      icon: Shield,
    },
    {
      label: "Total permissions",
      permission: "permission.read",
      value: permissions.data?.length,
      query: permissions,
      icon: KeyRound,
    },
  ];
  return (
    <>
      <PageHeading
        title="Overview"
        description="Identity and access management at a glance."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics
          .filter((m) => auth.has(m.permission))
          .map((m) => (
            <Card key={m.label}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">{m.label}</CardTitle>
                <m.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">
                  {m.query.isError ? "—" : (m.value ?? "…")}
                </div>
                {m.query.isError && (
                  <p className="text-xs text-destructive">Unable to load</p>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Service health</CardTitle>
          <CardDescription>Current connection status.</CardDescription>
        </CardHeader>
        <CardContent>
          <HealthRow label="Accounts Service" path="/health" />
          <HealthRow label="PostgreSQL" path="/health/db" />
          <HealthRow label="Object storage" path="/health/storage" />
        </CardContent>
      </Card>
    </>
  );
}

export default function Overview() {
  return (
    <DashboardPageGuard>
      <OverviewContent />
    </DashboardPageGuard>
  );
}
