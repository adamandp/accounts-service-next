"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/providers/auth-provider";
import type { Permission, Role } from "@/types/accounts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ResourceForm } from "./resource-form";
import { date, errorMessage } from "@/utils/format";
import { toast } from "sonner";
function Assign({
  record,
  permissions,
  onSave,
}: {
  record: Role;
  permissions: Permission[];
  onSave: (ids: string[]) => Promise<void>;
}) {
  const [ids, setIds] = useState(record.permissions.map((p) => p.id)),
    [busy, setBusy] = useState(false);
  const groups = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.code.split(".")[0]] ??= []).push(p);
    return acc;
  }, {});
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{ids.length} selected</p>
      {Object.entries(groups).map(([name, group]) => {
        const items = group ?? [];
        return (
          <div className="space-y-3 rounded-lg border p-4" key={name}>
            <div className="flex justify-between items-center">
              <h3 className="font-medium capitalize">{name}</h3>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={
                    items.every((p) => ids.includes(p.id))
                      ? true
                      : items.some((p) => ids.includes(p.id))
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(v) =>
                    setIds((old) =>
                      v === true
                        ? [...new Set([...old, ...items.map((p) => p.id)])]
                        : old.filter((id) => !items.some((p) => p.id === id)),
                    )
                  }
                />
                Select all
              </label>
            </div>
            {items.map((p) => (
              <label key={p.id} className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={ids.includes(p.id)}
                  onCheckedChange={(v) =>
                    setIds((old) =>
                      v === true
                        ? [...old, p.id]
                        : old.filter((x) => x !== p.id),
                    )
                  }
                />
                <span>
                  <span className="block">{p.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {p.code}
                  </span>
                </span>
              </label>
            ))}
          </div>
        );
      })}
      <Button
        disabled={
          busy ||
          (ids.length === record.permissions.length &&
            ids.every((id) => record.permissions.some((p) => p.id === id)))
        }
        onClick={async () => {
          setBusy(true);
          try {
            await onSave(ids);
            toast.success("Permissions updated.");
          } catch (e) {
            toast.error(errorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        Save permissions
      </Button>
    </div>
  );
}
export function ResourceDetail({
  kind,
  id,
}: {
  kind: "roles" | "permissions";
  id: string;
}) {
  const auth = useAuth(),
    qc = useQueryClient(),
    router = useRouter();
  const singular = kind === "roles" ? "role" : "permission";
  const [edit, setEdit] = useState(false);
  const q = useQuery({
    queryKey: [kind, id],
    queryFn: () => api<Permission | Role>("/" + kind + "/" + id),
  });
  const canAssign =
    kind === "roles" &&
    auth.has("role.assign_permission") &&
    auth.has("permission.read");
  const all = useQuery({
    queryKey: ["permissions"],
    queryFn: () => api<Permission[]>("/permissions"),
    enabled: canAssign && !!q.data && !q.data.isSystem,
  });
  const r = q.data;
  async function invalidate() {
    await qc.invalidateQueries({ queryKey: [kind] });
    await qc.invalidateQueries({ queryKey: ["users"] });
    await auth.reload();
  }
  return (
    <>
      <PageHeading
        title={singular === "role" ? "Role details" : "Permission details"}
        description="View the authorization record and its configuration."
        action={
          <Button variant="outline" asChild>
            <Link href={"/" + kind}>Back</Link>
          </Button>
        }
      />
      <QueryState
        loading={q.isPending}
        error={q.error}
        retry={() => q.refetch()}
      >
        {r && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{r.name}</CardTitle>
                  <Badge variant="outline">
                    {r.isSystem ? "System" : "Custom"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Details
                  items={[
                    ["ID", r.id],
                    ["Code", r.code],
                    ["Name", r.name],
                    ["Description", r.description],
                    ["Created", date(r.createdAt)],
                    ["Updated", date(r.updatedAt)],
                  ]}
                />
                <div className="flex gap-2">
                  {!r.isSystem && auth.has(singular + ".update") && (
                    <Dialog open={edit} onOpenChange={setEdit}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit {singular}</DialogTitle>
                          <DialogDescription>
                            Update display information. The code remains
                            unchanged.
                          </DialogDescription>
                        </DialogHeader>
                        <ResourceForm
                          kind={kind}
                          record={r}
                          onSave={async (data) => {
                            await api("/" + kind + "/" + id, "PATCH", data);
                            await invalidate();
                            setEdit(false);
                            toast.success("Updated.");
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                  {!r.isSystem && auth.has(singular + ".delete") && (
                    <ConfirmAction
                      label="Delete"
                      title={"Delete this " + singular + "?"}
                      description="This action cannot be undone. The server will reject deletion if the record is protected or in use."
                      onConfirm={async () => {
                        await api("/" + kind + "/" + id, "DELETE");
                        await invalidate();
                        router.replace("/" + kind);
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            {"permissions" in r && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  {canAssign && !r.isSystem ? (
                    <QueryState
                      loading={all.isPending}
                      error={all.error}
                      retry={() => all.refetch()}
                    >
                      {all.data && (
                        <Assign
                          key={
                            r.updatedAt +
                            ":" +
                            r.permissions.map((p) => p.id).join(",")
                          }
                          record={r}
                          permissions={all.data}
                          onSave={async (ids) => {
                            await api("/roles/" + id + "/permissions", "PUT", {
                              permissionIds: ids,
                            });
                            await invalidate();
                          }}
                        />
                      )}
                    </QueryState>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {r.permissions.length ? (
                        r.permissions.map((p) => (
                          <Badge key={p.id} variant="outline">
                            {p.code}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No permissions assigned.
                        </span>
                      )}
                    </div>
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
