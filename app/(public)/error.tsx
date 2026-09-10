"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function PublicError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto my-16 w-[calc(100%_-_32px)] max-w-[1220px]">
      <ErrorState
        message="This content is temporarily unavailable. Please try again."
        onRetry={reset}
      />
    </main>
  );
}
