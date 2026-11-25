"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Permission } from "@/types/accounts";
import { errorMessage } from "@/utils/format";
export function ResourceForm({
  kind,
  record,
  onSave,
}: {
  kind: "roles" | "permissions";
  record?: Permission;
  onSave: (data: {
    code?: string;
    name: string;
    description: string | null;
  }) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setError("");
        try {
          await onSave({
            ...(record ? {} : { code: String(f.get("code")).trim() }),
            name: String(f.get("name")).trim(),
            description: String(f.get("description")).trim() || null,
          });
        } catch (e) {
          setError(errorMessage(e));
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          name="code"
          required
          defaultValue={record?.code}
          disabled={!!record}
          pattern={
            kind === "roles" ? "[A-Z0-9_]+" : "[a-z0-9_]+(\\.[a-z0-9_]+)+"
          }
          maxLength={kind === "roles" ? 30 : 100}
        />
        <p className="text-xs text-muted-foreground">
          Stable authorization identifier.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={record?.name}
          maxLength={kind === "roles" ? 80 : 120}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={record?.description ?? ""}
          maxLength={2000}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
    </form>
  );
}
