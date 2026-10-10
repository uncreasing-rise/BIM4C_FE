"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function ProjectsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[Projects Page Error Boundary caught]:", error);
  }, [error]);

  return (
    <main className="site-container pb-16 pt-32">
      <ErrorState
        message="The project catalogue is temporarily unavailable. Please try again."
        onRetry={retry}
      />
    </main>
  );
}
