"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would go to your error reporting service.
    console.error(error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>

        {/* Show the underlying cause in development to aid debugging. In
            production only the digest is shown so it can be matched to logs. */}
        {isDev && error?.message && (
          <pre className="mt-4 overflow-x-auto rounded-md border bg-muted/40 p-3 text-left text-xs text-destructive scrollbar-thin">
            {error.message}
          </pre>
        )}
        {error?.digest && (
          <p className="mt-2 text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <a href="/">Go home</a>
          </Button>
        </div>

        {isDev && (
          <p className="mt-4 text-xs text-muted-foreground">
            Tip: check <code>/api/health</code> for database &amp; env status.
          </p>
        )}
      </div>
    </div>
  );
}
