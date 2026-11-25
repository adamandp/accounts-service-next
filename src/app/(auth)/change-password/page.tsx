"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { PasswordForm } from "@/components/account/password-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { errorMessage } from "@/utils/format";
export default function Page() {
  const auth = useAuth(),
    router = useRouter();
  useEffect(() => {
    if (!auth.loading && !auth.error) {
      if (!auth.user) router.replace("/login");
      else if (!auth.user.mustChangePassword)
        router.replace("/account/security");
    }
  }, [auth, router]);
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 bg-muted/30">
      {auth.error ? (
        <>
          <p>{auth.error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </>
      ) : auth.loading ? (
        <p>Loading account…</p>
      ) : auth.user?.mustChangePassword ? (
        <>
          <PasswordForm required />
          <Button
            variant="ghost"
            onClick={() =>
              auth
                .logout()
                .then(() => router.replace("/login"))
                .catch((e) => toast.error(errorMessage(e)))
            }
          >
            Sign out
          </Button>
        </>
      ) : null}
    </main>
  );
}
