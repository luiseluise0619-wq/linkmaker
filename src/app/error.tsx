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

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} className="mt-6">
          Try again
        </Button>
      </div>
    </div>
  );
}
