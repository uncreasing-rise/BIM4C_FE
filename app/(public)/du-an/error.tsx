"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function ProjectsError({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto my-16 w-[calc(100%_-_32px)] max-w-[1200px] md:w-[calc(100%_-_48px)]">
      <ErrorState
        message="The project catalogue is temporarily unavailable. Please try again."
        onRetry={retry}
      />
    </main>
  );
}
