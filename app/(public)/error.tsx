"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { appLogger } from "@/lib/logging/logger";

export default function PublicError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    appLogger.error("ui.public_error_boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <main className="site-container pb-20 pt-36">
      <ErrorState onRetry={retry} />
    </main>
  );
}
