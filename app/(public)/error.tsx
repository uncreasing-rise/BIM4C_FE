"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function PublicError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[Public Error Boundary caught]:", error);
  }, [error]);

  return (
    <main className="site-container pb-20 pt-36">
      <ErrorState onRetry={retry} />
    </main>
  );
}
