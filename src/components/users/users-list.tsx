"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { UserPage } from "@/types/accounts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeading } from "@/components/layout/page-heading";
import { QueryState } from "@/components/layout/query-state";
import { UserAvatar } from "@/components/layout/user-avatar";
import { date } from "@/utils/format";
export function UsersList() {
  const [draft, setDraft] = useState(""),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1);
  const q = useQuery({
    queryKey: ["users", search, page],
    queryFn: () =>
      api<UserPage>(
        "/users?" +
          new URLSearchParams({ q: search, page: String(page), limit: "20" }),
      ),
  });
  const pages = Math.max(1, Math.ceil((q.data?.total ?? 0) / 20));
  return (
    <>
      <PageHeading
        title="Users"
        description="Manage user identities, account status and roles."
      />
      <form
        className="flex max-w-sm gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(draft.trim());
        }}
      >
        <Input
          aria-label="Search users"
          placeholder="Search users…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button variant="outline">Search</Button>
      </form>
      <QueryState
        loading={q.isPending}
        error={q.error}
        retry={() => q.refetch()}
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {["User", "Email", "Role", "Status", "Created", ""].map(
                  (h, i) => (
                    <TableHead key={i}>{h}</TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.data?.items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar user={u} />
                      <div>
                        <div className="font-medium">
                          {u.name || u.username || "Unnamed"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {u.username ? "@" + u.username : "OAuth account"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{u.email || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "secondary" : "destructive"}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{date(u.createdAt)}</TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={"/users/" + u.id}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!q.data?.items.length && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {q.data?.total ?? 0} users · Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </QueryState>
    </>
  );
}
