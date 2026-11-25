"use client";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";

export function DashboardPageGuard({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission?: string;
}) {
  const auth = useAuth();
  if (auth.loading)
    return (
      <main className="grid min-h-svh place-items-center text-muted-foreground">
        Loading account…
      </main>
    );
  if (auth.error)
    return (
      <main className="grid min-h-svh place-items-center">
        <div className="space-y-4 text-center">
          <p>{auth.error}</p>
          <div className="flex justify-center gap-2">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  if (!auth.user || auth.user.mustChangePassword) return null;
  if (permission && !auth.has(permission))
    return (
      <div>
        <h1 className="text-xl font-semibold">Access forbidden</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  return <>{children}</>;
}
