"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Boundary caught]:", error);
  }, [error]);

  return (
    <main className="site-container pb-16 pt-32">
      <ErrorState onRetry={retry} />
    </main>
  );
}
