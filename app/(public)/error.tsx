"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function PublicError({ retry }: { retry: () => void }) {
  return (
    <main className="site-container pb-16 pt-32">
      <ErrorState
        message="This content is temporarily unavailable. Please try again."
        onRetry={retry}
      />
    </main>
  );
}
