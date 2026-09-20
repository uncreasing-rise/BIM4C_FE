"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { appLogger } from "@/lib/logging/logger";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    appLogger.error("ui.global_error_boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <main className="site-container pb-16 pt-32">
      <ErrorState onRetry={retry} />
    </main>
  );
}
