import { Suspense } from "react";
import { Dashboard } from "@/components/layout/dashboard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-svh place-items-center text-muted-foreground">
          Loading account…
        </main>
      }
    >
      <Dashboard>{children}</Dashboard>
    </Suspense>
  );
}
