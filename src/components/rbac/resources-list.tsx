"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/providers/auth-provider";
import type { Permission, Role } from "@/types/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { PageHeading } from "@/components/layout/page-heading";
import { QueryState } from "@/components/layout/query-state";
import { ResourceForm } from "./resource-form";
import { toast } from "sonner";
export function ResourcesList({ kind }: { kind: "roles" | "permissions" }) {
  const auth = useAuth(),
    qc = useQueryClient();
  const role = kind === "roles",
    singular = role ? "role" : "permission",
    title = role ? "Roles" : "Permissions";
  const [search, setSearch] = useState(""),
    [open, setOpen] = useState(false);
  const q = useQuery({
    queryKey: [kind],
    queryFn: () => api<(Permission | Role)[]>("/" + kind),
  });
  const items =
    q.data?.filter((r) =>
      [r.name, r.code, r.description].some((s) =>
        s?.toLowerCase().includes(search.toLowerCase()),
      ),
    ) ?? [];
  return (
    <>
      <PageHeading
        title={title}
        description={
          role
            ? "Manage roles and their assigned permissions."
            : "Manage reusable authorization permissions."
        }
        action={
          auth.has(singular + ".create") && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Create {singular}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create {singular}</DialogTitle>
                  <DialogDescription>
                    Define a unique code and display name.
                  </DialogDescription>
                </DialogHeader>
                <ResourceForm
                  kind={kind}
                  onSave={async (data) => {
                    await api("/" + kind, "POST", data);
                    await qc.invalidateQueries({ queryKey: [kind] });
                    setOpen(false);
                    toast.success("Created successfully.");
                  }}
                />
              </DialogContent>
            </Dialog>
          )
        }
      />
      <Input
        className="max-w-sm"
        aria-label={"Search " + kind}
        placeholder={"Search " + kind + "…"}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <QueryState
        loading={q.isPending}
        error={q.error}
        retry={() => q.refetch()}
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                {role && <TableHead>Permissions</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="font-mono text-xs">{r.code}</TableCell>
                  {role && (
                    <TableCell>
                      {"permissions" in r ? r.permissions.length : 0}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="outline">
                      {r.isSystem ? "System" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={"/" + kind + "/" + r.id}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow>
                  <TableCell
                    colSpan={role ? 5 : 4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground">{items.length} records</p>
      </QueryState>
    </>
  );
}
