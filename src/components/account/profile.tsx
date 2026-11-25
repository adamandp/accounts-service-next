"use client";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/services/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/layout/page-heading";
import { Details } from "@/components/layout/details";
import { UserAvatar } from "@/components/layout/user-avatar";
import type { User } from "@/types/accounts";
import { date, errorMessage } from "@/utils/format";
import { toast } from "sonner";
function ProfileForm({ user }: { user: User }) {
  const auth = useAuth();
  const [busy, setBusy] = useState(false),
    [file, setFile] = useState<File | null>(null),
    [remove, setRemove] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "").trim(),
      name = String(form.get("name") ?? "").trim() || null,
      email = String(form.get("email") ?? "").trim() || null;
    setBusy(true);
    try {
      let imageBase64: string | null | undefined = remove ? null : undefined;
      if (file) {
        if (
          file.size > 1024 * 1024 ||
          !["image/png", "image/jpeg", "image/webp"].includes(file.type)
        )
          throw new Error("Choose a PNG, JPEG or WebP image up to 1 MiB.");
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result).split(",")[1]);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
      }
      await api("/users/me", "PATCH", {
        ...(username ? { username } : {}),
        name,
        email,
        ...(imageBase64 !== undefined ? { imageBase64 } : {}),
      });
      await auth.reload();
      setFile(null);
      setRemove(false);
      toast.success("Profile updated.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal information</CardTitle>
        <CardDescription>
          Update your identity and profile image.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={submit}>
          <div className="flex flex-wrap items-center gap-4">
            <UserAvatar user={user} />
            <div className="space-y-2">
              <Label htmlFor="image">Profile image</Label>
              <Input
                id="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setRemove(false);
                }}
              />
              <p className="text-xs text-muted-foreground">
                {remove
                  ? "Image will be removed."
                  : "PNG, JPEG or WebP · Max 1 MiB"}
              </p>
              {user.imageUrl && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setRemove(true);
                  }}
                >
                  Remove image
                </Button>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={user.username ?? ""}
                minLength={3}
                maxLength={50}
                pattern="[A-Za-z0-9_.-]+"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name ?? ""}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                defaultValue={user.email ?? ""}
                maxLength={320}
              />
            </div>
          </div>
          <Button disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
export function Profile() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <>
      <PageHeading
        title="My profile"
        description="Manage your personal account information."
      />
      <ProfileForm key={user.updatedAt} user={user} />
      <Card>
        <CardHeader>
          <CardTitle>Account information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Details
            items={[
              ["Account ID", user.id],
              ["Role", user.role],
              ["Status", user.isActive ? "Active" : "Inactive"],
              ["Created", date(user.createdAt)],
              ["Updated", date(user.updatedAt)],
            ]}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium">Effective permissions</p>
            <div className="flex flex-wrap gap-2">
              {user.permissions.length ? (
                user.permissions.map((p) => (
                  <Badge key={p} variant="outline">
                    {p}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No administrative permissions.
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
