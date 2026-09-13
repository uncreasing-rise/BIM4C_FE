"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="site-container pb-16 pt-32">
      <ErrorState onRetry={retry} />
    </main>
  );
}
