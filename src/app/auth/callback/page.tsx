"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { errorMessage } from "@/utils/format";
import { Button } from "@/components/ui/button";
export default function Callback() {
  const auth = useAuth(),
    router = useRouter(),
    started = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    window.history.replaceState(null, "", window.location.pathname);
    if (!code) {
      queueMicrotask(() => setError("Sign-in was cancelled or failed."));
      return;
    }
    auth
      .exchange(code)
      .then((u) =>
        router.replace(u.mustChangePassword ? "/change-password" : "/overview"),
      )
      .catch((e) => setError(errorMessage(e)));
  }, [auth, router]);
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <p role="status">{error || "Completing sign-in…"}</p>
      {error && (
        <Button onClick={() => router.replace("/login")}>
          Back to sign in
        </Button>
      )}
    </main>
  );
}
