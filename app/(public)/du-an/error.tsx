"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function ProjectsError({ retry }: { retry: () => void }) {
  return (
    <main className="site-container pb-16 pt-32">
      <ErrorState
        message="The project catalogue is temporarily unavailable. Please try again."
        onRetry={retry}
      />
    </main>
  );
}
