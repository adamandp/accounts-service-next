"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/providers/auth-provider";
import type { User, Role } from "@/types/accounts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeading } from "@/components/layout/page-heading";
import { QueryState } from "@/components/layout/query-state";
import { Details } from "@/components/layout/details";
import { ConfirmAction } from "@/components/layout/confirm-action";
import { UserAvatar } from "@/components/layout/user-avatar";
import { date, errorMessage, validPassword } from "@/utils/format";
import { toast } from "sonner";
export function UserDetail({ id }: { id: string }) {
  const auth = useAuth(),
    qc = useQueryClient();
  const q = useQuery({
    queryKey: ["user", id],
    queryFn: () => api<User>("/users/" + id),
  });
  const roles = useQuery({
    queryKey: ["roles"],
    queryFn: () => api<Role[]>("/roles"),
    enabled: auth.has("user.assign_role") && auth.has("role.read"),
  });
  const [role, setRole] = useState(""),
    [password, setPassword] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  const u = q.data;
  async function update(path: string, method: string, body: unknown) {
    await api(path, method, body);
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["user", id] }),
      qc.invalidateQueries({ queryKey: ["users"] }),
    ]);
    if (auth.user?.id === id) await auth.reload();
  }
  return (
    <>
      <PageHeading
        title="User details"
        description="Manage identity and access for this user."
        action={
          <Button variant="outline" asChild>
            <Link href="/users">Back to users</Link>
          </Button>
        }
      />
      <QueryState
        loading={q.isPending}
        error={q.error}
        retry={() => q.refetch()}
      >
        {u && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <UserAvatar user={u} />
                  <div>
                    <CardTitle>
                      {u.name || u.username || "Unnamed user"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {u.email || u.username || "No email"}
                    </p>
                  </div>
                  <Badge
                    className="ml-auto"
                    variant={u.isActive ? "secondary" : "destructive"}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Details
                  items={[
                    ["User ID", u.id],
                    ["Username", u.username],
                    ["Email", u.email],
                    ["Role", u.role],
                    ["Created", date(u.createdAt)],
                    ["Updated", date(u.updatedAt)],
                    [
                      "Password change required",
                      u.mustChangePassword ? "Yes" : "No",
                    ],
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Effective permissions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {u.permissions.length ? (
                  u.permissions.map((p) => (
                    <Badge variant="outline" key={p}>
                      {p}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No permissions assigned.
                  </p>
                )}
              </CardContent>
            </Card>
            {auth.has("user.assign_role") && auth.has("role.read") && (
              <Card>
                <CardHeader>
                  <CardTitle>Assign role</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Select value={role || u.roleId} onValueChange={setRole}>
                    <SelectTrigger className="min-w-0 w-full sm:w-72">
                      <SelectValue placeholder="Choose a role">
                        {roles.data?.find((r) => r.id === (role || u.roleId))
                          ?.name ?? u.role}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {roles.data?.map((r) => (
                        <SelectItem key={r.id} value={r.id} textValue={r.name}>
                          <span className="grid min-w-0 gap-0.5">
                            <span className="font-medium whitespace-normal">
                              {r.name}
                            </span>
                            <span className="text-xs text-muted-foreground break-all">
                              {r.code}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ConfirmAction
                    disabled={!role || role === u.roleId}
                    label="Save role"
                    title="Change user role?"
                    description="This changes the user's effective permissions."
                    destructive={false}
                    onConfirm={() =>
                      update("/users/" + id + "/role", "PATCH", {
                        roleId: role,
                      })
                    }
                  />
                  {roles.isError && (
                    <p className="text-sm text-destructive">
                      Unable to load roles.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            {(auth.has("user.update_status") ||
              auth.has("user.reset_password")) && (
              <Card>
                <CardHeader>
                  <CardTitle>Account actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {auth.has("user.update_status") && (
                    <ConfirmAction
                      label={
                        u.isActive ? "Deactivate account" : "Activate account"
                      }
                      title={
                        u.isActive
                          ? "Deactivate this account?"
                          : "Activate this account?"
                      }
                      description={
                        u.isActive
                          ? "This user will lose access."
                          : "This user can sign in again."
                      }
                      destructive={u.isActive}
                      onConfirm={() =>
                        update("/users/" + id + "/status", "PATCH", {
                          isActive: !u.isActive,
                        })
                      }
                    />
                  )}
                  {auth.has("user.reset_password") && (
                    <Dialog
                      open={open}
                      onOpenChange={(v) => {
                        if (!busy) {
                          setOpen(v);
                          setPassword("");
                          setConfirmation("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          Reset password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset password</DialogTitle>
                          <DialogDescription>
                            Set a temporary password. Existing sessions will be
                            revoked and the user must change it at next sign-in.
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          className="space-y-4"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (
                              !validPassword(password) ||
                              password !== confirmation
                            )
                              return;
                            setBusy(true);
                            try {
                              await update(
                                "/users/" + id + "/password-reset",
                                "POST",
                                { newPassword: password },
                              );
                              toast.success("Temporary password set.");
                              setOpen(false);
                              setPassword("");
                              setConfirmation("");
                            } catch (e) {
                              toast.error(errorMessage(e));
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          <div className="space-y-2">
                            <Label htmlFor="temp">Temporary password</Label>
                            <Input
                              id="temp"
                              type="password"
                              autoComplete="new-password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm">Confirm password</Label>
                            <Input
                              id="confirm"
                              type="password"
                              autoComplete="new-password"
                              value={confirmation}
                              onChange={(e) => setConfirmation(e.target.value)}
                            />
                          </div>
                          <Button
                            disabled={
                              busy ||
                              !validPassword(password) ||
                              password !== confirmation
                            }
                          >
                            Reset password
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </QueryState>
    </>
  );
}
