"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function PublicError({ retry }: { retry: () => void }) {
  return (
    <main className="site-container pb-20 pt-36">
      <ErrorState onRetry={retry} />
    </main>
  );
}
