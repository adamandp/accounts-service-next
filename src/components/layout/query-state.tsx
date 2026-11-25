"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/utils/format";
export function QueryState({
  loading,
  error,
  retry,
  children,
}: {
  loading: boolean;
  error: unknown;
  retry: () => void;
  children: React.ReactNode;
}) {
  if (loading)
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((x) => (
          <Skeleton key={x} className="h-12 w-full" />
        ))}
      </div>
    );
  if (error)
    return (
      <div className="rounded-lg border p-6 text-center space-y-3">
        <p role="alert" className="text-sm text-destructive">
          {errorMessage(error)}
        </p>
        <Button variant="outline" onClick={retry}>
          Retry
        </Button>
      </div>
    );
  return children;
}
