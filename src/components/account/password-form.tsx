"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorMessage, validPassword } from "@/utils/format";
import { toast } from "sonner";
export function PasswordForm({ required = false }: { required?: boolean }) {
  const auth = useAuth(),
    router = useRouter();
  const [current, setCurrent] = useState(""),
    [next, setNext] = useState(""),
    [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false);
  const valid =
    validPassword(current) &&
    validPassword(next) &&
    current !== next &&
    next === confirm;
  return (
    <Card className={required ? "w-full max-w-md" : undefined}>
      <CardHeader>
        <CardTitle>
          {required ? "Change your temporary password" : "Change password"}
        </CardTitle>
        <CardDescription>
          {required
            ? "You must set a new password before accessing your account."
            : "Changing your password revokes existing sessions. You will need to sign in again."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!valid) return;
            setBusy(true);
            try {
              await api("/users/me/password", "PUT", {
                currentPassword: current,
                newPassword: next,
              });
              auth.clear();
              toast.success("Password changed. Sign in again.");
              router.replace("/login");
            } catch (e) {
              toast.error(errorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              8–72 UTF-8 bytes, different from current password.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {confirm && next !== confirm && (
              <p className="text-xs text-destructive">
                Passwords do not match.
              </p>
            )}
          </div>
          <Button disabled={!valid || busy}>
            {busy ? "Updating…" : "Change password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
